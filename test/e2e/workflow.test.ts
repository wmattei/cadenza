import { describe, it } from "node:test";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { App, Stack } from "aws-cdk-lib";
import { Workflow } from "@cadenza/cdk"; // your construct
import { strictEqual } from "node:assert";

const WORKFLOWS = [
  {
    name: "HelloWorkflow",
    entry: "test/e2e/fixtures/HelloWorkflow.ts",
  },
];

const SNAPSHOT_DIR = join(__dirname, "__snapshots__");

describe("E2E: CDK output", () => {
  for (const workflow of WORKFLOWS) {
    describe(`Workflow: ${workflow.name}`, () => {
      it("matches the expected output snapshot", () => {
        const app = new App();
        const stack = new Stack(app, "TestStack");

        new Workflow(stack, workflow.name, {
          workflowEntry: workflow.entry,
        });

        const template = app
          .synth()
          .getStackArtifact(stack.artifactId).template;
        const current = JSON.stringify(template, null, 2);

        const snapshotFile = join(
          SNAPSHOT_DIR,
          `${workflow.name}.snapshot.json`
        );

        if (process.env.UPDATE_SNAPSHOT === "1" || !existsSync(snapshotFile)) {
          writeFileSync(snapshotFile, current);
          console.log("📸 Snapshot updated.");
        } else {
          const expected = readFileSync(snapshotFile, "utf8");
          strictEqual(
            current,
            expected,
            "Generated template did not match snapshot."
          );
        }
      });
    });
  }
});
