import { MetadataRegistry } from '@cadenza/core';
import {
  Block,
  CallExpression,
  ClassDeclaration,
  IfStatement,
  Node,
  Statement,
  SyntaxKind,
} from 'ts-morph';
import { ExecutionGraph } from './models/execution-graph';
import { ExecutionNode } from './models/execution-node';
import { BuiltInValidators } from './validators';

export class BlockAnalyzer {
  constructor(
    private readonly graph: ExecutionGraph,
    private readonly classDecl: ClassDeclaration,
    private readonly isBranched: boolean = false,
  ) {}
  private current: ExecutionNode | null = null;

  analyzeBlock(block: Block, isMainMethod: boolean = false): ExecutionNode | null {
    let localRoot: ExecutionNode | null = null;
    for (const stmt of block.getStatements()) {
      const stmtNode = this.analyzeStatement(stmt, isMainMethod);
      if (!stmtNode) continue;
      stmtNode.path = [...(this.current?.path || []), stmtNode.id];

      console.info(stmtNode.path);

      if (this.current?.kind === 'choice') {
        this.current.data.branches.push({
          condition: 'default',
          next: stmtNode || ExecutionNode.noop(),
        });
      }
      this.current?.setNext(stmtNode);
      this.current = stmtNode;

      if (!localRoot) {
        localRoot = stmtNode;
      }
    }
    return localRoot;
  }

  private analyzeStatement(stmt: Statement, isMainMethod: boolean = false): ExecutionNode | null {
    if (isMainMethod && isEmptyReturn(stmt)) {
      const successNode = ExecutionNode.success();
      return successNode;
    }

    if (stmt.getKind() === SyntaxKind.IfStatement) {
      return this.handleIfStatement(stmt as IfStatement, isMainMethod);
    }

    const call = stmt.getFirstDescendantByKind(SyntaxKind.CallExpression);
    if (call) {
      return this.handleCallExpression(call);
    }

    return ExecutionNode.noop();
  }

  private handleCallExpression(call: CallExpression) {
    const expr = call.getExpression();
    if (!Node.isPropertyAccessExpression(expr)) return null;

    const methodName = expr.getName();
    const methodDecl = this.classDecl.getMethod(methodName);
    const className = this.classDecl.getNameOrThrow();
    if (!methodDecl) return null;
    const taskMeta = MetadataRegistry.getTasksForWorkflow(className)?.get(methodName);

    if (taskMeta) {
      const body = methodDecl.getBodyText()!;
      // TODO custom validators
      BuiltInValidators.lambda.validate(body, methodDecl, taskMeta);

      const node = new ExecutionNode(methodName, taskMeta.kind, {
        code: body,
        ...(taskMeta.options ?? {}),
      });
      return node;
    }

    // Not decorated: visit its body recursively
    const body = methodDecl.getBody();
    if (body) {
      return this.analyzeBlock(body as Block, false);
    }

    return null;
  }

  private handleIfStatement(ifStmt: IfStatement, insideRun: boolean = false) {
    const condition = ifStmt.getExpression().getText();
    const thenBlock = ifStmt.getThenStatement();
    // const elseBlock = ifStmt.getElseStatement();

    const choiceNode = new ExecutionNode('choice', 'choice', {
      conditionRaw: condition,
      branches: [],
    });

    const thenNode = new BlockAnalyzer(this.graph, this.classDecl, true).analyzeBlock(
      thenBlock as Block,
      insideRun,
    );

    if (thenNode) {
      choiceNode.data.branches.push({
        condition: condition,
        next: thenNode,
      });
    }

    // this.graph.addNode(choiceNode);
    return choiceNode;
  }
}

export function isEmptyReturn(stmt: Statement): boolean {
  return (
    stmt.getKind() === SyntaxKind.ReturnStatement &&
    stmt.getFirstChildByKind(SyntaxKind.ExpressionStatement) === undefined
  );
}
