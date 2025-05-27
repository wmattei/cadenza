import { NodeEmitter } from './node-emitter';
import { LambdaNodeEmitter } from './node-emitters/lambda-node-emitter';
import { PassNodeEmitter } from './node-emitters/pass-node-emitter';

export function registerDefaultEmitters() {
  NodeEmitterRegistry.register('lambda', new LambdaNodeEmitter());
  NodeEmitterRegistry.register('transition', new PassNodeEmitter());
}

export class NodeEmitterRegistry {
  private static emitters: Map<string, NodeEmitter> = new Map();

  static register(kind: string, emitter: NodeEmitter) {
    this.emitters.set(kind, emitter);
  }

  static get(kind: string): NodeEmitter {
    const emitter = this.emitters.get(kind);
    if (!emitter) throw new Error(`No NodeEmitter registered for kind: ${kind}`);
    return emitter;
  }

  static clear() {
    this.emitters.clear();
  }

  static getAll(): Map<string, NodeEmitter> {
    return new Map(this.emitters);
  }
}
