import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { ExecutionNode } from "../../types";
import { NodeEmitter } from "../node-emitter";

export class LambdaNodeEmitter implements NodeEmitter {
  emit(scope: Construct, node: ExecutionNode) {
    const fn = new Function(scope, `${node.id}Lambda`, {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromInline(node.code!),
      handler: "index.handler",
    });

    // TODO check if the function exists in the graph

    return new LambdaInvoke(scope, node.id, {
      lambdaFunction: fn,
      inputPath: "$",
      outputPath: "$.Payload",
    });
  }
}
