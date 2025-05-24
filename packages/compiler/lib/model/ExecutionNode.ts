export type TaskKind = "lambda" | "fargate" | "transition";

export interface ExecutionNode {
  id: string;
  kind: TaskKind;
  method: Function;
  dependsOn: string[];
}

export interface ExecutionGraph {
  workflowName: string;
  nodes: ExecutionNode[];
}
