import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Workflow } from "@cadenza/cdk";
import { HelloWorkflow } from "../src";

export class DevWorkflowStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Workflow(this, "HelloWorkflow", {
      workflowClass: HelloWorkflow,
    });
  }
}
