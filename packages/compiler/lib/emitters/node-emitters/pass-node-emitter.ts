import { Pass } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ExecutionNode } from "../../model";
import { NodeEmitter } from "../node-emitter";

export class PassNodeEmitter implements NodeEmitter {
  emit(scope: Construct, node: ExecutionNode): any {
    return new Pass(scope, node.id, {});
  }
}
