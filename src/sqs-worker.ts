import { Credentials } from 'aws-sdk';
import * as SQS from 'aws-sdk/clients/sqs';
import * as Consumer from 'sqs-consumer';
import { ITaskClass, Task } from './task';
import { TaskRouter } from './task-router';

export interface ISqsWorkerConfig {
  sqsUrl: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  verbose?: boolean;
  debug?: boolean;
}

export interface ISqsWorkerTaskResult {
  durationMs: number;
  taskResult: any;
}

export type SqsWorkerSuccessfulTaskCallback = (task: Task, result: ISqsWorkerTaskResult) => void;
export type SqsWorkerFailedTaskCallback = (taskName: string, error: any) => void;

export class SqsWorker {
  private consumer: Consumer;

  constructor(
    public config: ISqsWorkerConfig,
    successCallback?: SqsWorkerSuccessfulTaskCallback,
    failCallback?: SqsWorkerFailedTaskCallback
  ) {
    if (!config || !config.sqsUrl || !config.accessKeyId || !config.secretAccessKey || !config.region) {
      throw new Error('Invalid SQS worker config: ' + JSON.stringify(config));
    }
    this.consumer = Consumer.create({
      queueUrl: config.sqsUrl,
      handleMessage: this.buildMessageHandler(successCallback, failCallback),
      sqs: new SQS({
        credentials: new Credentials(config.accessKeyId, config.secretAccessKey),
        region: config.region,
      }),
      messageAttributeNames: ['type'],
    });

    this.consumer.on('error', err => this.errorHandler(err));
    this.consumer.on('processing_error', err => this.processingErrorHandler(err));
  }

  public registerTasksForProcessingAndStartConsuming(taskTypes: Array<ITaskClass>) {
    taskTypes.forEach(taskType => {
      TaskRouter.registerTask(taskType);

      taskType.workerConfig = this.config;
    });

    this.consumer.start();
  }

  private buildMessageHandler(
    successCallback?: SqsWorkerSuccessfulTaskCallback,
    failCallback?: SqsWorkerFailedTaskCallback
  ) {
    return async (message: SQS.Message) => {
      // do some work with `message`

      if (this.config.debug) {
        console.log('message: ' + JSON.stringify(message));
      }

      const start = new Date().getTime();

      let task: Task;

      TaskRouter.deserializeTask(message)
        .then(t => {
          task = t;
          return task.doTaskWork();
        })
        .then(result => {
          if (result && result.error) {
            if (this.config.verbose) {
              console.log(
                'Job ' + task.constructor.name + ' (' + message.MessageId + ') error: ' + JSON.stringify(result.error)
              );
            }

            let type = 'unknown';
            if (message.MessageAttributes && message.MessageAttributes.type) {
              type = message.MessageAttributes.type.StringValue as string;
            }
            if (failCallback) {
              failCallback(type, result.error);
            }

            return Promise.reject(result.error);
          } else {
            if (this.config.verbose) {
              let msg = task.constructor.name + '[' + message.MessageId + '] ' + (new Date().getTime() - start) + ' ms';

              if (result && result.message) {
                msg += ': ' + result.message;
              }
              console.log(msg);
            }

            if (successCallback) {
              successCallback(task, {
                durationMs: new Date().getTime() - start,
                taskResult: result,
              });
            }
            return Promise.resolve();
          }
        })
        .catch(err => {
          if (this.config.verbose) {
            console.log('Job ' + task.constructor.name + ' (' + message.MessageId + ') error: ', err);
          }
          let type = 'unknown';
          if (message.MessageAttributes && message.MessageAttributes.type) {
            type = message.MessageAttributes.type.StringValue as string;
          }
          if (failCallback) {
            failCallback(type, err);
          }
          return Promise.resolve();
        });
    };
  }

  private errorHandler(err: any) {
    if (!this.config || this.config.verbose) {
      console.error('ts-sqs-worker: There was an error in the sqs task');
      console.error(err);
      console.error(err.stack);
    }
  }

  private processingErrorHandler(err: any) {
    if (!this.config || this.config.verbose) {
      console.error('ts-sqs-worker: There was a processing_error in the sqs task');
      console.error(err);
      console.error(err.stack);
    }
  }
}
