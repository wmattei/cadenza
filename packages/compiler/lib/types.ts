export type ExecutionNodeKind = "lambda" | "fargate";

export interface ExecutionNode {
  id: string;
  kind: ExecutionNodeKind;
  dependsOn: string[];
  code?: string;
}

export interface ExecutionGraph {
  workflowName: string;
  nodes: ExecutionNode[];
}
