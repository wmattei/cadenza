import { ExecutionGraph, ExecutionNode } from '@cadenza/compiler';

export function generateDotGraph(graph: ExecutionGraph): string {
  const lines = [`digraph ${graph.workflowName} {`];
  const visited = new Set<string>();

  function visit(node: ExecutionNode) {
    if (visited.has(node.path.join(''))) return;
    visited.add(node.path.join(''));

    lines.push(`  ${node.path.join('')} [label="${node.kind}\\n${node.kind}"];`);

    if (node.isChoice()) {
      for (const branch of node.data.branches || []) {
        lines.push(
          `  ${node.path.join('')} -> ${branch.next.path.join('')} [label="${branch.condition === 'default' ? 'default' : branch.condition}"];`,
        );
        visit(branch.next);
      }
    } else {
      if (node.next) {
        lines.push(`  ${node.path.join('')} -> ${node.next?.path.join('')};`);
        visit(node.next!);
      }
    }
  }

  visit(graph.root!);

  lines.push('}');
  return lines.join('\n');
}
