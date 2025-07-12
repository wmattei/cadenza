import { CadenzaEmitter, ExecutionGraph, isNextable } from '@cadenza/compiler';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

import { NodeEmitter } from './node-emitter';
import { NodeEmitterRegistry, registerDefaultEmitters } from './node-emitter-registry';

export class StepFunctionsEmitter implements CadenzaEmitter {
  constructor(
    private scope: Construct,
    private emittersOverride?: Record<string, NodeEmitter>,
  ) {
    registerDefaultEmitters();
    this.registerCustomEmitters();
  }

  emit(graph: ExecutionGraph): sfn.StateMachine {
    const states: Record<string, sfn.IChainable> = {};

    for (const node of graph.nodes) {
      if (node.kind === 'task') {
        const emitter = NodeEmitterRegistry.get(node.type);
        states[node.id] = emitter.emit(this.scope, node);
      }

      if (node.kind === 'choice') {
        const choice = new sfn.Choice(this.scope, node.id, {});
        states[node.id] = choice;
      }
    }

    const wired = new Set<string>();

    for (const node of graph.nodes) {
      if (isNextable(node) && node.next) {
        const nextNode = states[node.next];
        if (!nextNode) {
          throw new Error(`Next node ${node.next} not found for node ${node.id}`);
        }
        (states[node.id] as sfn.INextable & sfn.IChainable).next(nextNode);
        wired.add(node.id);
      }
    }

    const rootNode = graph.nodes[0];
    if (!rootNode) throw new Error('No root node found');

    const definition = states[rootNode.id];

    return new sfn.StateMachine(this.scope, graph.workflowName, {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
    });
  }

  private registerCustomEmitters() {
    if (this.emittersOverride) {
      for (const [kind, emitter] of Object.entries(this.emittersOverride)) {
        NodeEmitterRegistry.register(kind, emitter);
      }
    }
  }
}
