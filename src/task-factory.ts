import { ITaskClass } from './i-task-class';
import { Mapper } from './mapper';
import { Task } from './task';

export class TaskFactory {
  private static taskTypes: { [key: string]: ITaskClass } = {};

  public static registerTask(taskType: ITaskClass) {
    this.taskTypes[taskType.name] = taskType;
  }

  public static async build(type: string, parameters?: { [key: string]: any }, verbose?: boolean): Promise<Task> {
    type = type.trim();

    if (verbose) {
      console.log('ts-sqs-worker.TaskFactory: Building task: ' + type);
    }

    const taskType = this.taskTypes[type];

    if (!taskType) {
      throw new Error('Invalid task type: ' + type);
    }

    if (verbose) {
      console.log('ts-sqs-worker.TaskFactory: Got taskType: ', taskType);
    }

    const task = await Mapper.map(parameters, taskType);

    if (verbose) {
      console.log('ts-sqs-worker.TaskFactory: Built task: ', task);
    }
    return task;
  }
}
