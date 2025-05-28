import { ExecutionGraph } from '@cadenza/compiler';

export function generateDotGraph(graph: ExecutionGraph): string {
  const lines = ['digraph G {'];

  for (const node of graph.nodes) {
    lines.push(`  ${node.id} [label="${node.kind}\\n${node.id}"];`);
    if (node.next) {
      lines.push(`  ${node.id} -> ${node.next};`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}
