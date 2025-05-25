export type ExecutionNodeKind = "lambda" | "fargate";

export interface ExecutionNode {
  id: string;
  kind: ExecutionNodeKind;
  code: string;
  dependsOn: string[];
}

export interface ExecutionGraph {
  workflowName: string;
  nodes: ExecutionNode[];
}
