export type ExecutionNodeKind = "lambda" | "fargate";

export type ExecutionNode = {
  id: string;
  kind: ExecutionNodeKind;
  dependsOn: string[];
  data: Record<string, any>;
};

export type ExecutionGraph = {
  workflowName: string;
  nodes: ExecutionNode[];
};
