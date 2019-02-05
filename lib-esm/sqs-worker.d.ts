import { ITaskClass, Task } from './task';
export interface ISqsWorkerConfig {
    sqsUrl: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
}
export declare type SqsWorkerSuccessfulTaskCallback = (task: Task, result: any) => void;
export declare type SqsWorkerFailedTaskCallback = (taskName: string, error: any) => void;
export declare class SqsWorker {
    config: ISqsWorkerConfig;
    private consumer;
    constructor(config: ISqsWorkerConfig, successCallback?: SqsWorkerSuccessfulTaskCallback, failCallback?: SqsWorkerFailedTaskCallback);
    registerTasksForProcessingAndStartConsuming(taskTypes: Array<ITaskClass>): void;
    private buildMessageHandler;
    private static errorHandler;
    private static processingErrorHandler;
}
