import { ExecutionNode } from '@cadenza/compiler';
import { IChainable, INextable } from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

export interface NodeEmitter {
  emit(scope: Construct, node: ExecutionNode): INextable & IChainable;
}
