import { Construct } from "constructs";
import { ExecutionGraphBuilder } from "../graph";
import { NodeEmitter, StepFunctionsEmitter } from "../emitters";
import {
  NodeEmitterRegistry,
  registerDefaultEmitters,
} from "../emitters/node-emitter-registry";

export class CadenzaCompiler {
  constructor(private emittersOverride?: Record<string, NodeEmitter>) {}

  compile(scope: Construct, WorkflowClass: Function) {
    const graph = new ExecutionGraphBuilder(WorkflowClass).build();
    const emitter = new StepFunctionsEmitter();

    registerDefaultEmitters();
    if (this.emittersOverride) {
      for (const [kind, emitter] of Object.entries(this.emittersOverride)) {
        NodeEmitterRegistry.register(kind, emitter);
      }
    }

    return emitter.emit(scope, graph);
  }
}
