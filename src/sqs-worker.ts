import { Credentials } from 'aws-sdk';
import * as SQS from 'aws-sdk/clients/sqs';
import * as Consumer from 'sqs-consumer';
import { ISqsWorkerConfig } from './i-sqs-worker-config';
import { ISqsWorkerTaskResult } from './i-sqs-worker-task-result';
import { ITaskClass } from './i-task-class';
import { Task } from './task';
import { TaskFactory } from './task-factory';

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
      TaskFactory.registerTask(taskType);

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
        console.log('ts-sqs-worker: ' + 'message: ' + JSON.stringify(message));
      }

      const start = new Date().getTime();

      const bodyString = message.Body;
      if (!bodyString) {
        throw new Error('Invalid message, no body: ' + JSON.stringify(message));
      }

      const body = JSON.parse(bodyString);
      const messageType = body.type;
      if (!messageType || typeof messageType !== 'string') {
        throw new Error('Invalid message, message type not found or recognized: ' + JSON.stringify(body));
      }

      try {
        const task = await TaskFactory.build(messageType, body.parameters);

        const result = await task.run();

        if (result && result.error) {
          if (this.config.verbose) {
            console.log(
              'ts-sqs-worker: ' +
                'Job ' +
                task.constructor.name +
                ' (' +
                message.MessageId +
                ') error: ' +
                JSON.stringify(result.error)
            );
          }

          let type = 'unknown';
          if (message.MessageAttributes && message.MessageAttributes.type) {
            type = message.MessageAttributes.type.StringValue as string;
          }
          if (failCallback) {
            failCallback(type, result.error);
          }

          throw result.error;
        } else {
          if (this.config.verbose) {
            let msg =
              'ts-sqs-worker: ' +
              task.constructor.name +
              '[' +
              message.MessageId +
              '] ' +
              (new Date().getTime() - start) +
              ' ms';

            if (result && result.info) {
              msg += ': ' + result.info;
            }
            console.log(msg);
          }

          if (successCallback) {
            successCallback(task, {
              durationMs: new Date().getTime() - start,
              taskResult: result,
            });
          }
        }
      } catch (err) {
        if (this.config.verbose) {
          console.log('ts-sqs-worker: ' + 'Job ' + messageType + ' (' + message.MessageId + ') error: ', err);
        }
        let type = 'unknown';
        if (message.MessageAttributes && message.MessageAttributes.type) {
          type = message.MessageAttributes.type.StringValue as string;
        }
        if (failCallback) {
          failCallback(type, err);
        }
      }
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
