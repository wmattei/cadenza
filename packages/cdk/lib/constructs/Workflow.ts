import { join } from 'path';
import { CadenzaCompiler } from '@cadenza/compiler';
import { Construct } from 'constructs';
import { NodeEmitter, StepFunctionsEmitter } from '../emitter';

export interface WorkflowProps {
  /**
   * The entry point of the workflow.
   */
  workflowEntry: string;

  /**
   * Optional map of emitters to override the default behavior.
   * The key is the emitter type, and the value is the custom emitter instance.
   * This changes the way the stage is emmitted to the CDK stack.
   * For example, you can provide a custom emitter for Lambda functions, to add your function to a private VPC.
   *
   * @example
   * ```typescript
   * const customEmitter: NodeEmitter = new CustomLambdaNodeEmitter();
   * const workflow = new Workflow(this, 'MyWorkflow', {
   *   workflowClass: MyWorkflow,
   *   emittersOverride: {
   *    'lambda': customEmitter,
   *   }
   * })
   * ```
   */
  emittersOverride?: Record<string, NodeEmitter>;
}

export class Workflow extends Construct {
  constructor(scope: Construct, id: string, props: WorkflowProps) {
    super(scope, id);

    const emitter = new StepFunctionsEmitter(this, props.emittersOverride);

    const entry = join(process.cwd(), props.workflowEntry);

    const compiler = new CadenzaCompiler(emitter);
    compiler.compile(entry);
  }
}
