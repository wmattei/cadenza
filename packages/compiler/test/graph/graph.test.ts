import { deepStrictEqual, strictEqual, throws } from 'assert';
import { describe, it } from 'node:test';

import { ExecutionGraphBuilder } from '../../lib/graph';

describe('ExecutionGraphBuilder', () => {
  it('builds a graph from HelloWorkflow', () => {
    const graph = new ExecutionGraphBuilder('test/graph/fixtures/HelloWorkflow.ts').build();

    strictEqual(graph.workflowName, 'HelloWorkflow');
    strictEqual(graph.nodes.length, 2);

    const ids = graph.nodes.map((n) => n.id).sort();
    deepStrictEqual(ids, ['sayGoodbye', 'sayHello']);

    const sayGoodbye = graph.nodes.find((n) => n.id === 'sayGoodbye');
    deepStrictEqual(sayGoodbye?.dependsOn, ['sayHello']);
  });

  it('should throw an error when decorated methods are not implemented ', () => {
    throws(
      () => {
        new ExecutionGraphBuilder('test/graph/fixtures/NotImplementedHelloWorkflow.ts').build();
      },
      { name: 'GraphBuildError', message: 'Method sayHello has no body.' },
    );
  });
});
