import { MetadataRegistry } from "@cadenza/core";
import { ExecutionGraph, ExecutionNode } from "../types";
import { Block, Node, Project, SyntaxKind } from "ts-morph";

export class ExecutionGraphBuilder {
  constructor(private entry: string) {}

  build(): ExecutionGraph {
    const project = new Project({ tsConfigFilePath: "tsconfig.json" });
    const sourceFile = project.getSourceFileOrThrow(this.entry);

    const classDecl = sourceFile.getClasses()[0]; // TODO search by name or other criteria
    if (!classDecl) {
      throw new Error(`No class found in source file ${this.entry}`);
    }

    const className = classDecl.getNameOrThrow();
    const registeredTasks = MetadataRegistry.getTasksForWorkflow(className);

    const workflowClass = sourceFile.getClassOrThrow("HelloWorkflow");
    const runMethod = workflowClass.getMethodOrThrow("run");
    const body = runMethod.getBodyOrThrow() as Block;
    const statements = body.getStatements();

    const graph: ExecutionNode[] = [];

    let lastTaskId: string | null = null;

    for (const stmt of statements) {
      const call = stmt.getFirstDescendantByKind(SyntaxKind.CallExpression);
      if (!call) continue;

      const expr = call.getExpression();

      if (Node.isPropertyAccessExpression(expr)) {
        const taskName = expr.getName();

        if (registeredTasks.has(taskName)) {
          const taskMeta = registeredTasks.get(taskName)!;
          const methodDecl = workflowClass.getMethod(taskName);

          if (!methodDecl) {
            throw new Error(`Method ${taskName} not found in workflow class`);
          }

          const body = methodDecl.getBodyText();
          if (!body) {
            throw new Error(`Method ${taskName} has no body`);
          }

          graph.push({
            id: taskName,
            dependsOn: lastTaskId ? [lastTaskId] : [],
            code: body,
            kind: taskMeta.kind,
          });

          lastTaskId = taskName;
        }
      }
    }
    return {
      workflowName: className,
      nodes: graph,
    };
  }
}
