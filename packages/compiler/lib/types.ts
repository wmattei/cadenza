export type ExecutionNodeKind = 'lambda' | 'fargate' | 'choice';

export type ExecutionNode = {
  id: string;
  kind: string;
  next?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
};

export type ExecutionGraph = {
  workflowName: string;
  nodes: ExecutionNode[];
};
