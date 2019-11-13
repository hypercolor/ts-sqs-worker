import * as SQS from 'aws-sdk/clients/sqs';
import { ITaskClass, Task } from './task';

export class TaskRouter {
  private static taskTypes: Array<ITaskClass> = [];

  public static registerTask(taskType: ITaskClass) {
    this.taskTypes.push(taskType);
  }

  public static deserializeTask(message: SQS.Message): Promise<Task> {
    let params: any;
    try {
      params = JSON.parse(message.Body as string);
    } catch (err) {
      return Promise.reject(err);
    }

    if (message.MessageAttributes && message.MessageAttributes.type) {
      const type = message.MessageAttributes.type.StringValue;
      for (const taskType of this.taskTypes) {
        if (type === taskType.name) {
          return taskType.deserialize(params);
        }
      }
    }

    return Promise.reject(
      new Error(
        "Couldn't match task type: " +
          JSON.stringify(message.MessageAttributes) +
          '. Available types were: ' +
          JSON.stringify(this.taskTypes.map(t => t.name))
      )
    );
  }
}
