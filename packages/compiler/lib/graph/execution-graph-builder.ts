import { MetadataRegistry } from '@cadenza/core';
import { join } from 'path';
import ts from 'typescript';
import { ExecutionGraph, ExecutionNode, StepNode, TaskNode, ChoiceNode } from './models';

export class ExecutionGraphBuilder {
  private idCounter = 0;
  private graph: ExecutionNode[] = [];
  private sourceFile: ts.SourceFile;
  private runMethod?: ts.MethodDeclaration;
  private workflowClass?: ts.ClassDeclaration;

  constructor(private entry: string) {
    const program = ts.createProgram([this.entry], {});
    const sourceFile = program.getSourceFile(this.entry);
    if (!sourceFile) throw new Error(`Source file ${this.entry} not found`);
    this.sourceFile = sourceFile;
  }

  build(className?: string): ExecutionGraph {
    this.workflowClass = this.findWorkflowClass(className);
    if (!this.workflowClass) {
      throw new Error(
        className
          ? `Workflow class ${className} not found in ${this.entry}`
          : `No class was found in ${this.entry}`,
      );
    }

    this.loadWorkflowClass(); // Triggers decorator metadata registration
    return {
      workflowName: this.workflowClass.name!.text,
      nodes: this.graph,
    };
  }

  private loadWorkflowClass() {
    try {
      const className = this.workflowClass!.name!.text;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      new (require(join(this.entry))[className])();
      this.extractRunMethod(this.workflowClass!);
    } catch (error) {
      throw new Error(`Failed to load workflow class: ${error}`);
    }
  }

  private findWorkflowClass(name?: string): ts.ClassDeclaration | undefined {
    let found: ts.ClassDeclaration | undefined;
    ts.forEachChild(this.sourceFile, (node) => {
      if (ts.isClassDeclaration(node) && (!name || node.name?.text === name)) {
        found = node;
      }
    });
    return found;
  }

  private extractRunMethod(classNode: ts.ClassDeclaration) {
    for (const member of classNode.members) {
      if (
        ts.isMethodDeclaration(member) &&
        ts.isIdentifier(member.name) &&
        member.name.text === 'run' &&
        member.body
      ) {
        this.visit(member.body);
        break;
      }
    }
  }

  private visit(node: ts.Node): { first: string; last: string[] } | undefined {
    if (ts.isIfStatement(node)) return this.visitIfStatement(node);
    if (ts.isThrowStatement(node))
      return this.emitNode('fail', node.expression?.getText(this.sourceFile));
    if (ts.isReturnStatement(node)) return this.emitNode('success');
    if (ts.isBlock(node)) return this.visitBlock(node);
    if (ts.isExpressionStatement(node)) return this.visitExpression(node);
    if (ts.isVariableStatement(node)) return this.emitStep(node);
    return undefined;
  }

  private visitIfStatement(node: ts.IfStatement): { first: string; last: string[] } {
    const id = this.genId('choice');
    const condition = node.expression.getText(this.sourceFile);

    const trueBranch = this.visit(node.thenStatement);
    const falseBranch = node.elseStatement ? this.visit(node.elseStatement) : undefined;

    const trueId = trueBranch?.first ?? this.pass();
    const falseId = falseBranch?.first ?? this.pass();

    this.graph.push({
      id,
      kind: 'choice',
      condition,
      trueBranch: trueId,
      falseBranch: falseId,
    });

    const terminalNodes = [...(trueBranch?.last ?? []), ...(falseBranch?.last ?? [falseId])];

    return { first: id, last: terminalNodes };
  }

  private visitBlock(node: ts.Block): { first: string; last: string[] } | undefined {
    let firstId: string | undefined;
    let prevIds: string[] = [];

    for (const stmt of node.statements) {
      const result = this.visit(stmt);
      if (!result) continue;

      if (!firstId) firstId = result.first;
      this.connectNodes(prevIds, result.first);
      prevIds = result.last;
    }

    return firstId ? { first: firstId, last: prevIds } : undefined;
  }

  private visitExpression(
    node: ts.ExpressionStatement,
  ): { first: string; last: string[] } | undefined {
    const callExpr = this.unwrapCallExpression(node.expression);
    if (!callExpr || !ts.isPropertyAccessExpression(callExpr.expression))
      return this.emitStep(node);

    const methodName = callExpr.expression.name.text;
    const tasks = MetadataRegistry.getTasksForWorkflow(this.workflowClass!.name!.text);
    if (!tasks.has(methodName)) return this.emitStep(node);

    const id = this.genId(methodName);
    const task = tasks.get(methodName)!;

    this.graph.push({
      id,
      kind: 'task',
      name: methodName,
      type: task.type,
      data: task.data,
    });

    return { first: id, last: [id] };
  }

  private emitStep(node: ts.Node): { first: string; last: string[] } {
    const id = this.genId('step');
    this.graph.push({
      id,
      kind: 'step',
      description: node.getText(this.sourceFile),
    });
    return { first: id, last: [id] };
  }

  private emitNode(kind: 'fail' | 'success', error?: string): { first: string; last: string[] } {
    const id = this.genId(kind);
    this.graph.push({ id, kind, ...(error ? { error } : {}) });
    return { first: id, last: [id] };
  }

  private connectNodes(fromIds: string[], toId: string) {
    for (const fromId of fromIds) {
      const node = this.findGraphNode<StepNode | TaskNode | ChoiceNode>(fromId);
      if (node) node.next = toId;
    }
  }

  private unwrapCallExpression(expr: ts.Expression): ts.CallExpression | undefined {
    if (ts.isCallExpression(expr)) return expr;
    if (ts.isAwaitExpression(expr) && ts.isCallExpression(expr.expression)) return expr.expression;
    return undefined;
  }

  private genId(label?: string): string {
    return `${label ?? 'node'}_${this.idCounter++}`;
  }

  private pass(): string {
    const id = this.genId('pass');
    this.graph.push({ id, kind: 'pass' });
    return id;
  }

  private findGraphNode<T extends ExecutionNode>(id: string): T | undefined {
    return this.graph.find((n) => n.id === id) as T | undefined;
  }
}
