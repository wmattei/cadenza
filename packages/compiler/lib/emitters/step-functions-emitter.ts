import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

import { ExecutionGraph } from '../types';

import { NodeEmitter } from './node-emitter';
import { NodeEmitterRegistry, registerDefaultEmitters } from './node-emitter-registry';

export class StepFunctionsEmitter {
  constructor(private emittersOverride?: Record<string, NodeEmitter>) {
    registerDefaultEmitters();
    this.registerCustomEmitters();
  }

  emit(scope: Construct, graph: ExecutionGraph): sfn.StateMachine {
    const states: Record<string, sfn.INextable & sfn.IChainable> = {};

    for (const node of graph.nodes) {
      const emitter = NodeEmitterRegistry.get(node.kind);
      states[node.id] = emitter.emit(scope, node);
    }

    const wired = new Set<string>();

    for (const node of graph.nodes) {
      if (node.next) {
        const nextNode = states[node.next];
        if (!nextNode) {
          throw new Error(`Next node ${node.next} not found for node ${node.id}`);
        }
        states[node.id].next(nextNode);
        wired.add(node.id);
      }
    }

    const rootNode = graph.nodes[0];
    if (!rootNode) throw new Error('No root node found');

    const definition = states[rootNode.id];

    return new sfn.StateMachine(scope, graph.workflowName, {
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
