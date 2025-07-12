import { ExecutionGraph, isNextable } from '@cadenza/compiler';

export function generateDotGraph(graph: ExecutionGraph): string {
  const lines = [`digraph ${graph.workflowName} {`];

  for (const node of graph.nodes) {
    if (node.kind === 'task') {
      lines.push(`  ${node.id} [label="${node.name}"];`);
    }

    if (node.kind === 'choice') {
      lines.push(`  ${node.id} [label="Choice (${node.condition})"];`);
      lines.push(`  ${node.id} -> ${node.trueBranch} [label="true"];`);
      if (node.falseBranch) {
        lines.push(`  ${node.id} -> ${node.falseBranch} [label="false"];`);
      }
    }

    if (node.kind === 'step') {
      lines.push(`  ${node.id} [label="Step"];`);
    }

    // Handle nextable nodes
    if (isNextable(node) && node.next) {
      lines.push(`  ${node.id} -> ${node.next};`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}
