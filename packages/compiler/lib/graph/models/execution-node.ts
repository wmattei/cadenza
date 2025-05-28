import { ExecutionGraph } from './execution-graph';

export type ExecutionNodeKind = 'success' | 'lambda' | 'choice';
// const DECORATED_KIND: Array<ExecutionKind> = ['lambda'];

export class ExecutionNode {
  public next?: ExecutionNode;
  public previous: ExecutionNode[] = [];

  static success(graph: ExecutionGraph): ExecutionNode {
    const index = graph.countNodesByKind('success');
    return new ExecutionNode(`success_${index}`, 'success', {});
  }

  constructor(
    public readonly id: string,
    public readonly kind: ExecutionNodeKind,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly data: Record<string, any>,
  ) {}

  setNext(nextNode: ExecutionNode): ExecutionNode {
    this.next = nextNode;
    nextNode.previous.push(this);
    return nextNode;
  }

  addPrevious(previousNode: ExecutionNode): ExecutionNode {
    this.previous.push(previousNode);
    return this;
  }
}

// type DataOnly<T> = {
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
//   [K in keyof T as T[K] extends Function ? never : K]: T[K];
// };

// export type ExecutionNodeData = Omit<DataOnly<ExecutionNode>, 'graph' | 'previous'> & {
//   next?: string;
// };
