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

      if (
        Node.isPropertyAccessExpression(expr) &&
        expr.getExpression().getText() === "this"
      ) {
        const taskName = expr.getName();
        
        if (registeredTasks.has(taskName)) {
          const taskMeta = registeredTasks.get(taskName)!;

          graph.push({
            id: taskName,
            dependsOn: lastTaskId ? [lastTaskId] : [],
            code: taskMeta.fn.toString(),
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
