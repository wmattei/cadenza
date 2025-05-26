import { join } from 'path';

import { MetadataRegistry } from '@cadenza/core';
import {
  Block,
  ClassDeclaration,
  IfStatement,
  MethodDeclaration,
  Node,
  Project,
  Statement,
  SyntaxKind,
} from 'ts-morph';

import { ExecutionGraph, ExecutionNode } from '../types';
import { BuildError, printBuildError } from './error';
import { BuiltInValidators } from './validators';

export class ExecutionGraphBuilder {
  private nodes: ExecutionNode[] = [];
  private lastNode: ExecutionNode | null = null;

  constructor(private entry: string) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(join(process.cwd(), entry)); // Ensure the workflow entry is loaded so that the metadata is registered
  }

  build(): ExecutionGraph {
    const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
    const sourceFile = project.getSourceFileOrThrow(this.entry);

    const classDecl = sourceFile.getClasses()[0];
    const className = classDecl.getNameOrThrow();
    const runMethod = classDecl.getMethodOrThrow('run');
    const body = runMethod.getBodyOrThrow();

    try {
      this.visitBlock(body as Block, classDecl, true);

      return {
        workflowName: className,
        nodes: this.nodes,
      };
    } catch (error) {
      if (error instanceof BuildError) {
        printBuildError(error);
      }
      throw error;
    }
  }

  private visitBlock(block: Block, classDecl: ClassDeclaration, insideRun = false) {
    for (const stmt of block.getStatements()) {
      this.visitStatement(stmt, classDecl, insideRun);
    }
  }

  private visitStatement(stmt: Statement, classDecl: ClassDeclaration, insideRun: boolean = false) {
    if (
      insideRun &&
      stmt.getKind() === SyntaxKind.ReturnStatement &&
      stmt.getFirstChildByKind(SyntaxKind.ExpressionStatement) === undefined
    ) {
      const successId = `success_${this.nodes.length}`;

      const node: ExecutionNode = {
        id: successId,
        kind: 'success',
        next: undefined,
        data: {},
      };

      this.chainNode(node);
      return;
    }

    if (stmt.getKind() === SyntaxKind.IfStatement) {
      this.handleIfStatement(stmt as IfStatement, classDecl, insideRun);
      return;
    }

    const call = stmt.getFirstDescendantByKind(SyntaxKind.CallExpression);
    if (!call) return;

    const expr = call.getExpression();
    if (!Node.isPropertyAccessExpression(expr)) return;

    const methodName = expr.getName();
    const methodDecl = classDecl.getMethod(methodName);
    const className = classDecl.getNameOrThrow();

    const taskMeta = MetadataRegistry.getTasksForWorkflow(className)?.get(methodName);

    if (taskMeta) {
      const body = methodDecl?.getBodyText() ?? '';
      BuiltInValidators.lambda.validate(
        body,
        methodDecl as MethodDeclaration,
        taskMeta,
        this.entry,
      );
      const node: ExecutionNode = {
        id: methodName,
        kind: taskMeta.kind,
        next: undefined,
        data: {
          code: methodDecl?.getBodyText() ?? '',
          ...(taskMeta.options || {}),
        },
      };
      this.chainNode(node);
    } else if (methodDecl) {
      const body = methodDecl.getBody();
      if (body) {
        this.visitBlock(body as Block, classDecl);
      }
    }
  }

  private handleIfStatement(
    ifStmt: IfStatement,
    classDecl: ClassDeclaration,
    insideRun: boolean = false,
  ) {
    const condition = ifStmt.getExpression().getText();
    const thenBlock = ifStmt.getThenStatement();
    const elseBlock = ifStmt.getElseStatement();

    const choiceId = `choice_${this.nodes.length}`;
    const choiceNode: ExecutionNode = {
      id: choiceId,
      kind: 'choice',
      next: undefined, // will be resolved after the branches
      data: {
        conditionRaw: condition,
        branches: [],
      },
    };

    this.chainNode(choiceNode);

    // Visit THEN branch
    const thenBuilder = new ExecutionGraphBuilder(this.entry);
    thenBuilder.lastNode = null;
    thenBuilder.nodes = [];

    if (Node.isBlock(thenBlock)) {
      thenBuilder.visitBlock(thenBlock, classDecl, insideRun);
    } else {
      thenBuilder.visitStatement(thenBlock, classDecl, insideRun);
    }

    const thenStart = thenBuilder.nodes[0]?.id;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    const thenEnd = thenBuilder.lastNode?.id;

    if (thenStart) {
      choiceNode.data.branches.push({ condition, next: thenStart });
    }

    // Visit ELSE branch
    let elseStart: string | undefined;
    let elseEnd: string | undefined;

    if (elseBlock) {
      const elseBuilder = new ExecutionGraphBuilder(this.entry);
      elseBuilder.lastNode = null;
      elseBuilder.nodes = [];

      if (Node.isBlock(elseBlock)) {
        elseBuilder.visitBlock(elseBlock, classDecl, insideRun);
      } else {
        elseBuilder.visitStatement(elseBlock, classDecl, insideRun);
      }

      elseStart = elseBuilder.nodes[0]?.id;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      elseEnd = elseBuilder.lastNode?.id;

      if (elseStart) {
        choiceNode.data.branches.push({ condition: 'default', next: elseStart });
      }

      this.nodes.push(...elseBuilder.nodes);
    }

    this.nodes.push(...thenBuilder.nodes);

    // Set continuation point: next tasks will attach to the end of both branches
    this.lastNode = null;

    // Store the two ends so the next task can depend on both
    const continuationTargets = [thenEnd, elseEnd].filter(Boolean);
    if (continuationTargets.length === 1) {
      this.lastNode = this.findNodeById(continuationTargets[0]!) || null;
    }
  }

  private chainNode(node: ExecutionNode) {
    if (this.lastNode) {
      this.lastNode.next = node.id;
    }
    this.nodes.push(node);
    this.lastNode = node;
  }

  private findNodeById(id: string): ExecutionNode | undefined {
    return this.nodes.find((n) => n.id === id);
  }
}
