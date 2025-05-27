import { CadenzaEmitter } from '../emitter';
import { ExecutionGraphBuilder } from '../graph';

export class CadenzaCompiler {
  constructor(private emitter: CadenzaEmitter) {}

  compile(workflowEntry: string) {
    const graph = new ExecutionGraphBuilder(workflowEntry).build();

    // TODO output the graph for debugging purposes. JSON or DOT format?

    return this.emitter.emit(graph);
  }
}
