export type TaskMetadataKind = "lambda" | "fargate";

export interface TaskMetadata {
  name: string;
  kind: TaskMetadataKind;
  workflowClass: Function;
  options: Record<string, any>;
}

export class MetadataRegistry {
  private static taskMap = new Map<string, Map<string, TaskMetadata>>();

  static registerTask(task: TaskMetadata) {
    const existing =
      this.taskMap.get(task.workflowClass.name) ||
      new Map<string, TaskMetadata>();
    existing.set(task.name, task);
    this.taskMap.set(task.workflowClass.name, existing);
  }

  static getTasksForWorkflow(clsName: string): Map<string, TaskMetadata> {
    return this.taskMap.get(clsName) ?? new Map<string, TaskMetadata>();
  }
}
