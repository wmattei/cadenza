import { ExecutionNode, ExecutionNodeKind } from './execution-node';

export class ExecutionGraph {
  public root: ExecutionNode | null = null;

  constructor(public workflowName: string) {}

  // chainNode(node: ExecutionNode): ExecutionNode {
  //   if (this.currentNode) {
  //     this.currentNode.setNext(node);
  //   }

  //   this.addNode(node);
  //   this.currentNode = node;
  //   return node;
  // }

  // setCurrent(node: ExecutionNode | undefined): void {
  //   this.currentNode = node;
  // }

  // getCurrent(): ExecutionNode | undefined {
  //   return this.currentNode;
  // }

  // static fromObject(obj: {
  //   workflowName: string;
  //   nodes: Array<{
  //     id: string;
  //     kind: string;
  //     next?: string;
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     data?: Record<string, any>;
  //   }>;
  // }): ExecutionGraph {
  //   const graph = new ExecutionGraph(obj.workflowName);

  //   const nodeMap: Record<string, ExecutionNode> = {};
  //   for (const rawNode of obj.nodes) {
  //     const node = new ExecutionNode(
  //       rawNode.id,
  //       rawNode.kind as ExecutionNodeKind,
  //       rawNode.data || {},
  //     );
  //     graph.addNode(node);
  //     nodeMap[node.id] = node;
  //   }

  //   for (const rawNode of obj.nodes) {
  //     const current = nodeMap[rawNode.id];
  //     if (rawNode.next) {
  //       const target = nodeMap[rawNode.next];
  //       if (target) {
  //         current.setNext(target);
  //       } else {
  //         throw new Error(`Node "${rawNode.id}" has unknown next target "${rawNode.next}"`);
  //       }
  //     }
  //   }

  //   return graph;
  // }
}
