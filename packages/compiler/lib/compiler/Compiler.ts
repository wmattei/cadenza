import { Construct } from "constructs";
import { ExecutionGraphBuilder } from "../graph";
import { NodeEmitter, StepFunctionsEmitter } from "../emitters";
import {
  NodeEmitterRegistry,
  registerDefaultEmitters,
} from "../emitters/node-emitter-registry";

export class CadenzaCompiler {
  constructor(private emittersOverride?: Record<string, NodeEmitter>) {}

  compile(scope: Construct, workflowEntry: string) {
    const graph = new ExecutionGraphBuilder(workflowEntry).build();

    // TODO output the graph for debugging purposes. JSON or DOT format?

    const emitter = new StepFunctionsEmitter();

    registerDefaultEmitters();
    this.registerCustomEmitters();

    return emitter.emit(scope, graph);
  }

  private registerCustomEmitters() {
    if (this.emittersOverride) {
      for (const [kind, emitter] of Object.entries(this.emittersOverride)) {
        NodeEmitterRegistry.register(kind, emitter);
      }
    }
  }
}
