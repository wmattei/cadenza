import { ExecutionNode, ExecutionNodeKind } from './execution-node';

export class ExecutionGraph {
  public nodes: ExecutionNode[] = [];
  private currentNode: ExecutionNode | undefined;

  constructor(public workflowName: string) {}

  addNode(node: ExecutionNode): ExecutionNode {
    this.nodes.push(node);
    return node;
  }

  findNodeById(id: string): ExecutionNode | undefined {
    return this.nodes.find((n) => n.id === id);
  }

  countNodesByKind(kind: string): number {
    return this.nodes.filter((n) => n.kind === kind).length;
  }

  get size(): number {
    return this.nodes.length;
  }

  chainNode(node: ExecutionNode): ExecutionNode {
    if (this.currentNode) {
      this.currentNode.setNext(node);
    }

    this.addNode(node);
    this.currentNode = node;
    return node;
  }

  setCurrent(node: ExecutionNode | undefined): void {
    this.currentNode = node;
  }

  getCurrent(): ExecutionNode | undefined {
    return this.currentNode;
  }

  static fromObject(obj: {
    workflowName: string;
    nodes: Array<{
      id: string;
      kind: string;
      next?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?: Record<string, any>;
    }>;
  }): ExecutionGraph {
    const graph = new ExecutionGraph(obj.workflowName);

    const nodeMap: Record<string, ExecutionNode> = {};
    for (const rawNode of obj.nodes) {
      const node = new ExecutionNode(
        rawNode.id,
        rawNode.kind as ExecutionNodeKind,
        rawNode.data || {},
      );
      graph.addNode(node);
      nodeMap[node.id] = node;
    }

    for (const rawNode of obj.nodes) {
      const current = nodeMap[rawNode.id];
      if (rawNode.next) {
        const target = nodeMap[rawNode.next];
        if (target) {
          current.setNext(target);
        } else {
          throw new Error(`Node "${rawNode.id}" has unknown next target "${rawNode.next}"`);
        }
      }
    }

    return graph;
  }

  toDot(): string {
    const lines: string[] = [];
    lines.push('digraph ExecutionGraph {');

    for (const node of this.nodes) {
      const label = `${node.id}\\n(${node.kind})`;
      lines.push(`  "${node.id}" [label="${label}"];`);

      if (node.next) {
        lines.push(`  "${node.id}" -> "${node.next}";`);
      }

      if (node.kind === 'choice' && node.data?.branches) {
        for (const branch of node.data.branches) {
          lines.push(`  "${node.id}" -> "${branch.next}" [label="${branch.condition}"];`);
        }
      }
    }

    lines.push('}');
    return lines.join('\n');
  }
}
