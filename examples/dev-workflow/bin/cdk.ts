import { App } from "aws-cdk-lib";

import { DevWorkflowStack } from "../lib/DevWorkflowStack";

const app = new App();
new DevWorkflowStack(app, "DevWorkflowStack");
