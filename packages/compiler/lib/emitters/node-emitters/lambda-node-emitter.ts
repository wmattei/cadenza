import { Duration } from "aws-cdk-lib";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";

import { ExecutionNode } from "../../types";
import { NodeEmitter } from "../node-emitter";

export class LambdaNodeEmitter implements NodeEmitter {
  emit(scope: Construct, node: ExecutionNode) {
    // TODO create provider strategy so developers can choose how to create the Lambda function
    const lambda = this.createLambdaFunction(scope, node);

    return new LambdaInvoke(scope, node.id, {
      lambdaFunction: lambda,
      inputPath: "$",
      outputPath: "$.Payload",
    });
  }

  private createLambdaFunction(
    scope: Construct,
    node: ExecutionNode
  ): Function {
    return new Function(scope, `${node.id}Lambda`, {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromInline(node.data.code!),
      handler: "index.handler",
      functionName: node.data.name,
      description: node.data.description,
      timeout: Duration.seconds(node.data.timeout),
      memorySize: node.data.memorySize,
    });
  }
}
