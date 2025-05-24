import { Construct } from "constructs";
import { CadenzaWorkflow } from "@cadenza/core";
import { CadenzaCompiler, StepFunctionsEmitter } from "@cadenza/compiler";

export interface WorkflowProps {
  /**
   * The workflow class to compile and deploy.
   */
  workflowClass: new (...args: any[]) => CadenzaWorkflow<any>;

  /**
   * Optional custom emitter strategy (defaults to Step Functions).
   */
//   emitter: StateMachineEmitter;
}

export class Workflow extends Construct {
  constructor(scope: Construct, id: string, props: WorkflowProps) {
    super(scope, id);

    const compiler = new CadenzaCompiler(new StepFunctionsEmitter());
    compiler.compile(props.workflowClass, this);
  }
}
