import { Construct } from "constructs";
import { StateMachineEmitter } from "../emitters";
import { ExecutionGraphBuilder } from "../graph";
import { CadenzaWorkflow } from "@cadenza/core";

export class CadenzaCompiler {
  constructor(private emitter: StateMachineEmitter) {}

  compile(
    WorkflowClass: Function,
    scope: Construct
  ) {
    const graph = new ExecutionGraphBuilder(WorkflowClass).build();
    return this.emitter.emit(graph, scope);
  }
}
