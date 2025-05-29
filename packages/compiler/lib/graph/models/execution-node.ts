export type ExecutionNodeKind = 'success' | 'lambda' | 'choice' | 'noop';
// const DECORATED_KIND: Array<ExecutionKind> = ['lambda'];

export class ExecutionNode {
  public next?: ExecutionNode;
  public previous: ExecutionNode[] = [];

  public path: string[] = [];

  static success(): ExecutionNode {
    return new ExecutionNode('success', 'success', {});
  }

  static noop(): ExecutionNode {
    const node = new ExecutionNode('noop', 'noop');
    return node;
  }

  constructor(
    public id: string,
    public kind: ExecutionNodeKind,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public data: Record<string, any> = {},
  ) {}

  // For debugging purposes
  private get [Symbol.toStringTag]() {
    return `$$${this.id}`;
  }

  setNext(node: ExecutionNode) {
    this.next = node;
    node.previous.push(this);
  }

  isChoice(): boolean {
    return this.kind === 'choice';
  }

  getBranchTargets(): string[] {
    return this.isChoice() ? this.data.branches.map((b: { next: ExecutionNode }) => b.next) : [];
  }

  addPrevious(node: ExecutionNode): void {
    if (!this.previous.includes(node)) {
      this.previous.push(node);
    }
  }
}
