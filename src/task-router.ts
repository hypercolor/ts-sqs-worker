import * as SQS from 'aws-sdk/clients/sqs';
import { ITaskClass, Task } from './task';

export class TaskRouter {
  private static taskTypes: Array<ITaskClass> = [];

  public static registerTask(taskType: ITaskClass) {
    this.taskTypes.push(taskType);
  }

  public static deserializeTask(message: SQS.Message): Promise<Task> {
    if (message.MessageAttributes && message.MessageAttributes.type) {
      const type = message.MessageAttributes.type.StringValue;
      for (const taskType of this.taskTypes) {
        if (type === taskType.name) {
          return taskType.deserialize(message.Body);
        }
      }
    }

    return Promise.reject(new Error("Couldn't match task type: " + JSON.stringify(message.MessageAttributes)));
  }
}
