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
  ) {}
  private current: ExecutionNode | null = null;

  analyzeBlock(block: Block, isMainMethod: boolean = false) {
    for (const stmt of block.getStatements()) {
      this.analyzeStatement(stmt, isMainMethod);
    }
  }

  private analyzeStatement(stmt: Statement, isMainMethod: boolean = false) {
    if (isMainMethod && isEmptyReturn(stmt)) {
      this.graph.chainNode(ExecutionNode.success(this.graph));
      return;
    }

    if (stmt.getKind() === SyntaxKind.IfStatement) {
      this.handleIfStatement(stmt as IfStatement, isMainMethod);
      return;
    }

    const call = stmt.getFirstDescendantByKind(SyntaxKind.CallExpression);
    if (call) {
      this.handleCallExpression(call);
      return;
    }
  }

  private handleCallExpression(call: CallExpression) {
    const expr = call.getExpression();
    if (!Node.isPropertyAccessExpression(expr)) return;

    const methodName = expr.getName();
    const methodDecl = this.classDecl.getMethod(methodName);
    const className = this.classDecl.getNameOrThrow();
    if (!methodDecl) return;
    const taskMeta = MetadataRegistry.getTasksForWorkflow(className)?.get(methodName);

    if (taskMeta) {
      const body = methodDecl.getBodyText()!;

      // TODO custom validators
      BuiltInValidators.lambda.validate(body, methodDecl, taskMeta);
      const node = new ExecutionNode(methodName, taskMeta.kind, {
        code: body,
        ...(taskMeta.options ?? {}),
      });

      this.graph.chainNode(node);
      return;
    }

    // Not decorated: visit its body recursively
    const body = methodDecl.getBody();
    if (body) {
      this.analyzeBlock(body as Block, false);
    }
  }

  private handleIfStatement(ifStmt: IfStatement, insideRun: boolean = false) {
    const condition = ifStmt.getExpression().getText();
    const thenBlock = ifStmt.getThenStatement();
    const elseBlock = ifStmt.getElseStatement();

    const choiceNode = new ExecutionNode(`choice_${this.graph.size}`, 'choice', {
      conditionRaw: condition,
      branches: [],
    });

    this.graph.chainNode(choiceNode);
    this.current?.setNext(choiceNode);
    this.current = choiceNode;

    const then = this.buildSubBranch(thenBlock, insideRun);
    if (then) {
      choiceNode.data.branches.push({ condition, next: then.entry.id });
      then.entry.addPrevious(choiceNode);
    }

    if (elseBlock) {
      const elseBranch = this.buildSubBranch(elseBlock, insideRun);
      if (elseBranch) {
        choiceNode.data.branches.push({ condition: 'default', next: elseBranch.entry.id });
        elseBranch.entry.addPrevious(choiceNode);
      }
    }

    this.current = null; // Continuation point will be decided after the branch
  }

  private buildSubBranch(
    blockOrStmt: Statement,
    insideRun: boolean,
  ): { entry: ExecutionNode; exit: ExecutionNode } | undefined {
    const originalCurrent = this.current;
    const initialLength = this.graph.nodes.length;

    if (Node.isBlock(blockOrStmt)) {
      this.analyzeBlock(blockOrStmt as Block, insideRun);
    } else {
      this.analyzeStatement(blockOrStmt, insideRun);
    }

    const newNodes = this.graph.nodes.slice(initialLength);

    if (newNodes.length === 0) return;

    const entry = newNodes[0];
    const exit = this.current!;

    // Restore current to before the branch
    this.current = originalCurrent;

    return { entry, exit };
  }
}

export function isEmptyReturn(stmt: Statement): boolean {
  return (
    stmt.getKind() === SyntaxKind.ReturnStatement &&
    stmt.getFirstChildByKind(SyntaxKind.ExpressionStatement) === undefined
  );
}
