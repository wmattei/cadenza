import { CadenzaCompiler, NodeEmitter } from "@cadenza/compiler";
import { CadenzaWorkflow } from "@cadenza/core";
import { Construct } from "constructs";

export interface WorkflowProps {
  /**
   * The workflow class to compile and deploy.
   */
  workflowClass: new (...args: any[]) => CadenzaWorkflow<any>;

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

    const compiler = new CadenzaCompiler();
    compiler.compile(this, props.workflowClass);
  }
}
