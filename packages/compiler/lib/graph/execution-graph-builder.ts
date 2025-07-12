import { MetadataRegistry } from '@cadenza/core';
import { join } from 'path';
import ts from 'typescript';
import { ExecutionGraph, ExecutionNode, StepNode, TaskNode } from './models';

export class ExecutionGraphBuilder {
  private idCounter = 0;
  private graph: ExecutionNode[] = [];
  private sourceFile: ts.SourceFile;

  private runMethod: ts.MethodDeclaration | undefined;
  private workflowClass: ts.ClassDeclaration | undefined;

  constructor(private entry: string) {
    const program = ts.createProgram([this.entry], {});
    const sourceFile = program.getSourceFile(this.entry);
    if (!sourceFile) {
      throw new Error(`Source file ${this.entry} not found`);
    }
    this.sourceFile = sourceFile;
  }

  build(className?: string): ExecutionGraph {
    this.workflowClass = this.findWorkflowClass(className);
    if (!this.workflowClass) {
      if (className) {
        throw new Error(`Workflow class ${className} not found in ${this.entry}`);
      }
      throw new Error(`No class was found in ${this.entry}`);
    }

    this.loadWorkflowClass();

    return {
      workflowName: this.workflowClass.name!.text,
      nodes: this.graph,
    };
  }

  private loadWorkflowClass() {
    try {
      // Ensure the workflow entry is loaded so that the metadata is registered
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      new (require(join(this.entry))[this.workflowClass!.name!.text])();
      this.extractRunMethod(this.workflowClass!);
    } catch (error) {
      throw new Error(`Failed to load workflow class ${this.workflowClass!.name!.text}: ${error}`);
    }
  }

  private findWorkflowClass(className?: string): ts.ClassDeclaration | undefined {
    let workflowClass: ts.ClassDeclaration | undefined;
    ts.forEachChild(this.sourceFile, (node) => {
      if (!ts.isClassDeclaration(node)) return;
      if (!!workflowClass) return;

      // If the class name is not provided, we use the first class we find
      if (!className) {
        workflowClass = node;
        return;
      }

      // If the class name is provided, we use the class that matches the name
      if (node.name?.text === className) {
        workflowClass = node;
        return;
      }
    });

    return workflowClass;
  }

  private extractRunMethod(classNode: ts.ClassDeclaration) {
    if (this.runMethod) {
      return;
    }

    for (const member of classNode.members) {
      if (
        ts.isMethodDeclaration(member) &&
        member.name &&
        ts.isIdentifier(member.name) &&
        member.name.text === 'run' &&
        member.body
      ) {
        this.visit(member.body);
      }
    }
  }

  private visit(node: ts.Node): { first: string; last: string } | undefined {
    if (ts.isIfStatement(node)) {
      const id = this.genId('choice');
      const condition = node.expression.getText(this.sourceFile);

      const trueBranch = this.visit(node.thenStatement);
      const falseBranch = node.elseStatement ? this.visit(node.elseStatement) : undefined;

      const trueId = trueBranch?.first ?? this.genId();
      const falseId = falseBranch?.first ?? this.genId();

      this.graph.push({
        id,
        kind: 'choice',
        condition,
        trueBranch: trueId,
        falseBranch: falseId,
      });

      // Return the last node of the longer branch, or just the choice node itself
      return {
        first: id,
        last: falseBranch?.last ?? trueBranch?.last ?? id,
      };
    }

    if (ts.isThrowStatement(node)) {
      const id = this.genId();
      this.graph.push({
        id,
        kind: 'fail',
        error: node.expression?.getText(this.sourceFile),
      });
      return { first: id, last: id };
    }

    if (ts.isReturnStatement(node)) {
      const id = this.genId('success');
      this.graph.push({
        id,
        kind: 'success',
      });
      return { first: id, last: id };
    }

    if (ts.isBlock(node)) {
      let firstId: string | undefined;
      let prevId: string | undefined;

      for (const stmt of node.statements) {
        const result = this.visit(stmt);
        if (!result) continue;

        if (!firstId) firstId = result.first;

        if (prevId) {
          const prevNode = this.graph.find((n) => n.id === prevId && isLinkableNode(n)) as StepNode;
          if (prevNode) prevNode.next = result.first;
        }

        prevId = result.last;
      }

      if (firstId && prevId) return { first: firstId, last: prevId };
      return undefined;
    }

    if (ts.isExpressionStatement(node)) {
      let callExpr: ts.CallExpression | undefined;

      if (ts.isCallExpression(node.expression)) {
        callExpr = node.expression;
      } else if (
        ts.isAwaitExpression(node.expression) &&
        ts.isCallExpression(node.expression.expression)
      ) {
        callExpr = node.expression.expression;
      }

      if (callExpr && ts.isPropertyAccessExpression(callExpr.expression)) {
        const propAccess = callExpr.expression;

        const methodName = propAccess.name.text;
        const id = this.genId(methodName);

        const tasks = MetadataRegistry.getTasksForWorkflow(this.workflowClass!.name!.text);
        if (tasks.has(methodName)) {
          const task = tasks.get(methodName)!;
          this.graph.push({
            id,
            kind: 'task',
            type: task.type,
            name: methodName,
            data: tasks.get(methodName)!.data,
          });
          return { first: id, last: id };
        }
      }
    }

    if (ts.isExpressionStatement(node) || ts.isVariableStatement(node)) {
      const id = this.genId();
      this.graph.push({
        id,
        kind: 'step',
        description: node.getText(this.sourceFile),
      });
      return { first: id, last: id };
    }

    return undefined;
  }

  private genId(name?: string): string {
    return `${name ?? 'node'}_${this.idCounter++}`;
  }
}

function isLinkableNode(node: ExecutionNode): node is StepNode | TaskNode {
  return node.kind === 'step' || node.kind === 'task';
}
