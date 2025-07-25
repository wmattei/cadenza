export interface ExecutionGraph {
  workflowName: string;
  nodes: ExecutionNode[];
}

export type NodeId = string;

export interface BaseNode {
  id: NodeId;
  kind: 'choice' | 'success' | 'fail' | 'step' | 'task' | 'pass';
}

export interface StepNode extends BaseNode {
  kind: 'step';
  description: string;
  next?: NodeId;
}

export interface ChoiceNode extends BaseNode {
  kind: 'choice';
  condition: string;
  trueBranch: NodeId;
  falseBranch?: NodeId;
  next?: NodeId;
}

export interface SuccessNode extends BaseNode {
  kind: 'success';
}

export interface FailNode extends BaseNode {
  kind: 'fail';
  error?: string;
}

export interface TaskNode extends BaseNode {
  kind: 'task';
  type: string;
  name: string;
  data: Record<string, unknown>;
  next?: NodeId;
}

export interface PassNode extends BaseNode {
  kind: 'pass';
}

export type ExecutionNode = StepNode | ChoiceNode | SuccessNode | FailNode | TaskNode | PassNode;

export function isNextable(node: ExecutionNode): node is StepNode | TaskNode {
  return node.kind === 'step' || node.kind === 'task' || node.kind === 'pass';
}
