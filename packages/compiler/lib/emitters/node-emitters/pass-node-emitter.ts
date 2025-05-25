import { Pass } from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

import { NodeEmitter } from '../node-emitter';
import { ExecutionNode } from '../../types';

export class PassNodeEmitter implements NodeEmitter {
  emit(scope: Construct, node: ExecutionNode) {
    return new Pass(scope, node.id, {});
  }
}
