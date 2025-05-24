import { Construct } from "constructs";
import { ExecutionGraph } from "../model/ExecutionNode";

export interface StateMachineEmitter {
  emit(graph: ExecutionGraph, scope: Construct): any;
}
