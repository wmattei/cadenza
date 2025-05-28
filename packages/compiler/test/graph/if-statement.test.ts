import { deepStrictEqual, ok } from 'assert';
import { describe, it } from 'node:test';

import { ExecutionGraphBuilder } from '../../lib/graph';

describe('If statement', () => {
  it('builds a graph with if statements', () => {
    const graph = new ExecutionGraphBuilder(
      'test/graph/fixtures/HelloWorkflowWithIfStatement.ts',
    ).build();


    const choiceNode = graph.nodes.find((n) => n.kind === 'choice');

    ok(choiceNode);
    deepStrictEqual(choiceNode?.data.conditionRaw, "hello === 'Hello, World'");
    deepStrictEqual(choiceNode?.data.branches.length, 2);

    const nextStatements = choiceNode?.data.branches.map((b: { next: string }) => b.next);
    deepStrictEqual(nextStatements, ['sayGoodbye', 'sayGoodbye']);
  });
});
