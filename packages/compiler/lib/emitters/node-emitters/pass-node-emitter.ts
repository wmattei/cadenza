import { Pass } from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

import { ExecutionNode } from '../../types';
import { NodeEmitter } from '../node-emitter';

export class PassNodeEmitter implements NodeEmitter {
  emit(scope: Construct, node: ExecutionNode) {
    return new Pass(scope, node.id, {});
  }
}
