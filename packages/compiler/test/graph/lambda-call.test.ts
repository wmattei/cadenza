import { join } from 'path';
import { ExecutionGraphBuilder } from '../../lib/graph';
import { TaskNode } from '../../lib/graph/models';

const fixturePath = join(process.cwd(), 'test/graph/fixtures/LambdaCall.ts');

describe('Lambda call', () => {
  it('builds a graph from lambda calls', () => {
    const graph = new ExecutionGraphBuilder(fixturePath).build('LambdaCallWorkflow');

    expect(graph.workflowName).toBe('LambdaCallWorkflow');
    expect(graph.nodes.length).toBe(2);

    const firstNode = graph.nodes[0] as TaskNode;
    const secondNode = graph.nodes[1] as TaskNode;

    expect(firstNode.kind).toBe('task');
    expect(secondNode.kind).toBe('task');

    expect(firstNode.id).toBe('sayHello_0');
    expect(secondNode.id).toBe('sayGoodbye_1');

    expect(firstNode.next).toBe(secondNode.id);
    expect(secondNode.next).toBeUndefined();

    expect(firstNode.data).toEqual({
      name: 'sayHello',
      description: undefined,
      memorySize: 128,
      timeout: 30000,
    });

    expect(secondNode.data).toEqual({
      name: 'sayGoodbye',
      description: undefined,
      memorySize: 128,
      timeout: 30000,
    });
  });

  it('should throw an error when given class is not found', () => {
    expect(() => new ExecutionGraphBuilder(fixturePath).build('NotFoundClass')).toThrow(
      `Workflow class NotFoundClass not found in ${fixturePath}`,
    );
  });
});
