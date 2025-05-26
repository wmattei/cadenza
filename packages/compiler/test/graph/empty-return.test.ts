import { ok, strictEqual } from 'assert';
import { describe, it } from 'node:test';

import { ExecutionGraphBuilder } from '../../lib/graph';

describe('Empty return', () => {
  it('builds a graph for empty return statement', () => {
    const graph = new ExecutionGraphBuilder(
      'test/graph/fixtures/HelloWorkflowWithEmptyReturn.ts',
    ).build();

    const choiceNode = graph.nodes.find((n) => n.kind === 'choice');
    strictEqual(choiceNode?.data.branches.length, 1);

    const successNode = graph.nodes.find((n) => n.kind === 'success');
    ok(successNode);

    strictEqual(successNode?.id, choiceNode?.data.branches[0].next);
  });

  it('should not consider methods not in the main method as success', () => {
    const graph = new ExecutionGraphBuilder(
      'test/graph/fixtures/HelloWorkflowWithEmptyReturnOnNonMainMethod.ts',
    ).build();

    console.info(graph.nodes);
    const successNode = graph.nodes.find((n) => n.kind === 'success');
    ok(!successNode);
  });
});
