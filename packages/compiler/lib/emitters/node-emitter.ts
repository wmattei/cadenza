import { Resource } from "aws-cdk-lib";
import { State } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ExecutionNode } from "../model/ExecutionNode";

export interface NodeEmitter {
  emit(scope: Construct, node: ExecutionNode): State;
}
