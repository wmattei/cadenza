import { ExecutionGraph } from '../graph/models';

export interface CadenzaEmitter {
  emit(graph: ExecutionGraph): unknown;
}
