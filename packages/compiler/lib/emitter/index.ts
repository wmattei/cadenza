import { ExecutionGraph } from '../types';

export interface CadenzaEmitter {
  emit(graph: ExecutionGraph): unknown;
}
