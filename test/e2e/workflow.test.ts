import { Workflow } from "@cadenza/cdk"; // your construct
import { App, Stack } from "aws-cdk-lib";
import { join } from "node:path";
import { describe, it, snapshot } from "node:test";

const WORKFLOWS = [
  {
    name: "HelloWorkflow",
    entry: "test/e2e/fixtures/HelloWorkflow.ts",
  },
  {
    name: "LambdaWithOptions",
    entry: "test/e2e/fixtures/LambdaWithOptions.ts",
  },
];

describe("E2E: CDK output", () => {
  snapshot.setResolveSnapshotPath(() =>
    join(__dirname, "__snapshots__", "workflow.test.ts.snapshot")
  );
  for (const workflow of WORKFLOWS) {
    describe(`Workflow: ${workflow.name}`, () => {
      it("matches the expected output snapshot", (t) => {
        const app = new App();
        const stack = new Stack(app, "TestStack");

        new Workflow(stack, workflow.name, {
          workflowEntry: workflow.entry,
        });

        const template = app
          .synth()
          .getStackArtifact(stack.artifactId).template;
        const current = JSON.stringify(template, null, 2);

        t.assert.snapshot(current);
      });
    });
  }
});
