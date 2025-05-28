import { ExecutionGraph } from "../graph";

export interface CadenzaEmitter {
  emit(graph: ExecutionGraph): unknown;
}
