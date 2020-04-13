import { ITaskClass } from './i-task-class';
import { Mapper } from './mapper';
import { Task } from './task';

export class TaskFactory {
  private static taskTypes: { [key: string]: ITaskClass } = {};

  public static registerTask(taskType: ITaskClass) {
    this.taskTypes[taskType.type] = taskType;
  }

  public static async build(type: string, parameters?: { [key: string]: any }): Promise<Task> {
    if (type) {
      type = type.trim();
    }
    const taskType = this.taskTypes[type];

    if (!taskType) {
      throw new Error('Invalid task type: ' + type);
    }

    return Mapper.map(parameters, taskType);
  }
}
