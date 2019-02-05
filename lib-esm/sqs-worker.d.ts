import { ITaskClass, Task } from './task';
export interface ISqsWorkerConfig {
    sqsUrl: string;
}
export declare type SqsWorkerSuccessfulTaskCallback = (task: Task, result: any) => void;
export declare type SqsWorkerFailedTaskCallback = (task: Task, error: any) => void;
export declare class SqsWorker {
    config: ISqsWorkerConfig;
    private consumer;
    constructor(config: ISqsWorkerConfig, successCallback?: SqsWorkerSuccessfulTaskCallback, failCallback?: SqsWorkerFailedTaskCallback);
    registerTasksForProcessing(taskTypes: Array<ITaskClass>): void;
    private buildMessageHandler;
    private static errorHandler;
    private static processingErrorHandler;
}
