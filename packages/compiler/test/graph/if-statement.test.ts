import { join } from 'path';
import { ExecutionGraphBuilder } from '../../lib/graph';
import { ChoiceNode } from '../../lib/graph/models';

const fixturePath = join(process.cwd(), 'test/graph/fixtures/IfStatement.ts');

describe('If statement', () => {
  it('builds a graph with if statements', () => {
    const graph = new ExecutionGraphBuilder(fixturePath).build('IfStatementWorkflow');

    const choiceNode = graph.nodes.find((n) => n.kind === 'choice') as ChoiceNode;

    expect(choiceNode).toBeDefined();
    expect(choiceNode!.condition).toBe("hello === 'Hello, World'");

    expect(choiceNode.trueBranch).toBe('sayHello_2');
    expect(choiceNode.falseBranch).toBe('sayGoodbye_3');
  });
});
