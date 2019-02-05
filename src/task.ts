import { Credentials } from 'aws-sdk';
import * as SQS from 'aws-sdk/clients/sqs';
import { ISqsWorkerConfig } from './sqs-worker';

export interface ITaskClass {
  name: string;
  workerConfig: ISqsWorkerConfig;
  deserialize(serializedParams: any): Promise<Task>;
}

export abstract class Task {
  static workerConfig: ISqsWorkerConfig;

  public abstract serialize(): { [key: string]: any };

  public abstract doTaskWork(): Promise<any>;

  public submit() {
    const config = (this.constructor as any).workerConfig;
    if (!config) {
      return Promise.reject(
        new Error(
          'Worker config not set for task ' + this.constructor.name + ', was it registered with a SqsWorkerSubmitter?'
        )
      );
    } else {
      return new SQS({
        credentials: new Credentials(config.accessKeyId, config.secretAccessKey),
        region: config.region,
      })
        .sendMessage({
          DelaySeconds: 0,
          MessageAttributes: {
            type: {
              DataType: 'String',
              StringValue: this.constructor.name,
            },
          },
          MessageBody: JSON.stringify(this.serialize()),
          QueueUrl: config.sqsUrl,
        })
        .promise();
    }
  }
}
