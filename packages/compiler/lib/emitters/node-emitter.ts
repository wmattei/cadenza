import { State } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ExecutionNode } from "../types";

export interface NodeEmitter {
  emit(scope: Construct, node: ExecutionNode): State;
}
