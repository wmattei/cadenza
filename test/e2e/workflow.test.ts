import { Workflow } from '@cadenza/cdk';
import { App, Stack } from 'aws-cdk-lib';

const WORKFLOWS = [
  {
    name: 'HelloWorkflow',
    entry: 'test/e2e/fixtures/HelloWorkflow.ts',
  },
  {
    name: 'LambdaWithOptions',
    entry: 'test/e2e/fixtures/LambdaWithOptions.ts',
  },
];

describe('E2E: CDK output', () => {
  describe.each(WORKFLOWS)('Workflow: $name', ({ name, entry }) => {
    it('matches the expected output snapshot', () => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');

      new Workflow(stack, name, {
        workflowEntry: entry,
      });

      const template = app.synth().getStackArtifact(stack.artifactId).template;
      const current = JSON.stringify(template, null, 2);

      expect(current).toMatchSnapshot();
    });
  });
});
