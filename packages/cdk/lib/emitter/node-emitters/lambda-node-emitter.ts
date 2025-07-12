import { TaskNode } from '@cadenza/compiler';
import { Duration } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

import { NodeEmitter } from '../node-emitter';

export class LambdaNodeEmitter implements NodeEmitter {
  emit(scope: Construct, node: TaskNode) {
    // TODO create provider strategy so developers can choose how to create the Lambda function
    const lambda = this.createLambdaFunction(scope, node);

    return new LambdaInvoke(scope, node.id, {
      lambdaFunction: lambda,
      inputPath: '$',
      outputPath: '$.Payload',
    });
  }

  private createLambdaFunction(scope: Construct, node: TaskNode): Function {
    return new Function(scope, `${node.id}Lambda`, {
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromInline(
        'module.exports.handler = async () => { return "Hello from Lambda"; };',
      ),
      handler: 'index.handler',
      functionName: node.name,
      description: node.data.description as string,
      timeout: Duration.seconds((node.data.timeout as number) || 3),
      memorySize: node.data.memorySize as number ,
    });
  }
}
