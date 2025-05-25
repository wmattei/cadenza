import { Construct } from 'constructs';

import { NodeEmitter, StepFunctionsEmitter } from '../emitters';
import { ExecutionGraphBuilder } from '../graph';

export class CadenzaCompiler {
  constructor(private emittersOverride?: Record<string, NodeEmitter>) {}

  compile(scope: Construct, workflowEntry: string) {
    const graph = new ExecutionGraphBuilder(workflowEntry).build();

    // TODO output the graph for debugging purposes. JSON or DOT format?

    const emitter = new StepFunctionsEmitter(this.emittersOverride);

    return emitter.emit(scope, graph);
  }
}
