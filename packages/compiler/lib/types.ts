export type ExecutionNodeKind = 'lambda' | 'fargate';

export type ExecutionNode = {
  id: string;
  kind: ExecutionNodeKind;
  dependsOn: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
};

export type ExecutionGraph = {
  workflowName: string;
  nodes: ExecutionNode[];
};
