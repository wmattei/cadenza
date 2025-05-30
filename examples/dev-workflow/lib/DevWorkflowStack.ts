import { Workflow } from '@cadenza/cdk';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class DevWorkflowStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Workflow(this, 'HelloWorkflow', {
      workflowEntry: 'src/index.ts',
    });
  }
}
