import { Construct } from "constructs";
import { StateMachineEmitter } from "../emitters";
import { ExecutionGraphBuilder } from "../graph";
import { CadenzaWorkflow } from "@cadenza/core";

export class CadenzaCompiler {
  constructor(private emitter: StateMachineEmitter) {}

  compile(
    WorkflowClass: new (...args: any[]) => CadenzaWorkflow<any>,
    scope: Construct
  ) {
    const graph = new ExecutionGraphBuilder(WorkflowClass).build();
    return this.emitter.emit(graph, scope);
  }
}
