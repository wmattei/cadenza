import { TaskNode } from '@cadenza/compiler';
import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { LambdaNodeEmitter } from '../../lib/emitter/node-emitters/lambda-node-emitter';

describe('LambdaNodeEmitter', () => {
  it('emits a lambda function', () => {
    const stack = new Stack();

    const lambdaNode: TaskNode = {
      name: 'taskALambda',
      id: 'taskA',
      kind: 'task',
      type: 'lambda',
      data: {
        timeout: 30,
        memorySize: 128,
        description: 'This is Task A',
      },
    };

    new LambdaNodeEmitter().emit(stack, lambdaNode);

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::Lambda::Function', 1);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      FunctionName: 'taskALambda',
      Description: 'This is Task A',
      Timeout: 30,
      MemorySize: 128,
    });
  });
});
