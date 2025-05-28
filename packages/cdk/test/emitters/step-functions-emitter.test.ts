import { ok } from 'assert';
import { describe, it } from 'node:test';

import { ExecutionGraph, ExecutionNode, ExecutionNodeKind } from '@cadenza/compiler';
import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';
import { NodeEmitter, StepFunctionsEmitter } from '../../lib/emitter';
import { NodeEmitterRegistry } from '../../lib/emitter/node-emitter-registry';

// Dummy emitter just to mock out real Lambda tasks
class MockLambdaNodeEmitter implements NodeEmitter {
  emit(scope: Construct, node: ExecutionNode): sfn.INextable & sfn.IChainable {
    return new sfn.Pass(scope, node.id);
  }
}

describe('StepFunctionsEmitter', () => {
  it('emits a state machine from a simple graph', () => {
    // Setup
    const stack = new Stack();
    const emitter = new StepFunctionsEmitter(stack);

    NodeEmitterRegistry.register('lambda', new MockLambdaNodeEmitter());

    const graph = ExecutionGraph.fromObject({
      workflowName: 'TestWorkflow',
      nodes: [
        {
          id: 'taskA',
          kind: 'lambda' as ExecutionNodeKind,
          next: 'taskB',
          data: {},
        },
        {
          id: 'taskB',
          kind: 'lambda' as ExecutionNodeKind,
          data: {},
        },
      ],
    });

    emitter.emit(graph);

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1);

    const smResource = template.findResources('AWS::StepFunctions::StateMachine');
    const smLogicalId = Object.keys(smResource)[0];
    const definition = smResource[smLogicalId].Properties.DefinitionString;

    const definitionStr = JSON.stringify(definition);

    ok(definitionStr.includes('taskA'));
    ok(definitionStr.includes('taskB'));
  });
});
