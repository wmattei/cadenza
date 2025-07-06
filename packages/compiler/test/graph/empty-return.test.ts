import { join } from 'path';
import { ExecutionGraphBuilder } from '../../lib/graph';
import { ChoiceNode } from '../../lib/graph/models';

const fixturePath = join(process.cwd(), 'test/graph/fixtures/EmptyReturn.ts');

describe('Empty return', () => {
  it('builds a graph for empty return statement', () => {
    const graph = new ExecutionGraphBuilder(fixturePath).build('EmptyReturnWorkflow');

    const choiceNode = graph.nodes.find((n) => n.kind === 'choice') as ChoiceNode;
    expect(choiceNode.trueBranch).toBe('success_2');
  });

  it('should not consider methods not in the main method as success', () => {
    const graph = new ExecutionGraphBuilder(fixturePath).build(
      'EmptyReturnWorkflowOnNonMainMethod',
    );

    const successNode = graph.nodes.find((n) => n.kind === 'success');
    expect(successNode).toBeUndefined();
  });
});
