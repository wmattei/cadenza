import { MetadataRegistry } from "@cadenza/core";
import { ExecutionGraph, ExecutionNode } from "../types";
import { Block, Node, Project, SyntaxKind } from "ts-morph";
import { BlockVisitor } from "./visitors/block-visitor";

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

    const visitor = new BlockVisitor({
      classDecl,
      taskRegistry: registeredTasks,
    });

    const graph = visitor.visit(body);

    return {
      workflowName: className,
      nodes: graph,
    };
  }
}
