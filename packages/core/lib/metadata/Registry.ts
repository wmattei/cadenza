export type TaskMetadataType = 'lambda';

export interface TaskMetadata {
  name: string;
  type: TaskMetadataType;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  workflowClass: Function;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export class MetadataRegistry {
  private static taskMap = new Map<string, Map<string, TaskMetadata>>();

  static registerTask(task: TaskMetadata) {
    const existing = this.taskMap.get(task.workflowClass.name) || new Map<string, TaskMetadata>();
    existing.set(task.name, task);
    this.taskMap.set(task.workflowClass.name, existing);
  }

  static getTasksForWorkflow(clsName: string): Map<string, TaskMetadata> {
    return this.taskMap.get(clsName) ?? new Map<string, TaskMetadata>();
  }

  static clear() {
    this.taskMap.clear();
  }

  static isRegistered(clsName: string, taskName: string): boolean {
    return this.taskMap.get(clsName)?.has(taskName) ?? false;
  }
}
