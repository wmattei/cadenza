interface TaskMetadata {
  name: string;
  fn: Function;
  kind: "lambda" | "fargate" | "transition";
  options: Record<string, any>;
  workflowClass: Function;
}

export class MetadataRegistry {
  private static taskMap = new Map<Function, TaskMetadata[]>();

  static registerTask(task: TaskMetadata) {
    const existing = this.taskMap.get(task.workflowClass) ?? [];
    this.taskMap.set(task.workflowClass, [...existing, task]);
  }

  static getTasksForWorkflow(cls: Function): TaskMetadata[] {
    return this.taskMap.get(cls) ?? [];
  }
}
