import { CadenzaWorkflow, MetadataRegistry } from "@cadenza/core";
import { ExecutionGraph, ExecutionNode } from "../model";

export class ExecutionGraphBuilder {
  constructor(private workflow: Function) {}

  build(): ExecutionGraph {
    const tasks = MetadataRegistry.getTasksForWorkflow(
      this.workflow
    );

    console.info(tasks);

    // TODO use this with ts-morph
    const runMethod = this.workflow.prototype.run;

    const nodes: ExecutionNode[] = tasks.map((task) => ({
      id: task.name,
      kind: task.kind,
      method: task.fn,
      dependsOn: [],
    }));

    return {
      workflowName: this.workflow.name,
      nodes,
    };
  }
}
