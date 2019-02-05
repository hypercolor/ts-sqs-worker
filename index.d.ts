// Generated by dts-bundle v0.7.3
// Dependencies for this module:
//   ../aws-sdk/clients/sqs

import * as SQS from 'aws-sdk/clients/sqs';

export interface ISqsWorkerConfig {
    sqsUrl: string;
}
export type SqsWorkerSuccessfulTaskCallback = (task: Task, result: any) => void;
export type SqsWorkerFailedTaskCallback = (task: Task, error: any) => void;
export class SqsWorker {
    config: ISqsWorkerConfig;
    constructor(config: ISqsWorkerConfig, successCallback?: SqsWorkerSuccessfulTaskCallback, failCallback?: SqsWorkerFailedTaskCallback);
    registerTasksForProcessing(taskTypes: Array<ITaskClass>): void;
}

export interface ITaskClass {
    name: string;
    workerConfig: ISqsWorkerConfig;
    deserialize(serializedParams: any): Promise<Task>;
}
export abstract class Task {
    static workerConfig: ISqsWorkerConfig;
    abstract serialize(): any;
    abstract doTaskWork(): Promise<any>;
    submit(): Promise<import("aws-sdk/lib/request").PromiseResult<SQS.SendMessageResult, import("aws-sdk").AWSError>>;
}

export class SqsWorkerSubmitter {
    constructor(config: ISqsWorkerConfig);
    registerTasksForSubmitting(taskTypes: Array<ITaskClass>): this;
    registerTaskForSubmitting(taskType: ITaskClass): this;
}

