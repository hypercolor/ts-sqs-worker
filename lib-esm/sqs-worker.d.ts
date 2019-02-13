import { ITaskClass, Task } from './task';
export interface ISqsWorkerConfig {
    sqsUrl: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    verbose?: boolean;
}
export interface ISqsWorkerTaskResult {
    durationMs: number;
    taskResult: any;
}
export declare type SqsWorkerSuccessfulTaskCallback = (task: Task, result: ISqsWorkerTaskResult) => void;
export declare type SqsWorkerFailedTaskCallback = (taskName: string, error: any) => void;
export declare class SqsWorker {
    config: ISqsWorkerConfig;
    private consumer;
    constructor(config: ISqsWorkerConfig, successCallback?: SqsWorkerSuccessfulTaskCallback, failCallback?: SqsWorkerFailedTaskCallback);
    registerTasksForProcessingAndStartConsuming(taskTypes: Array<ITaskClass>): void;
    private buildMessageHandler;
    private errorHandler;
    private processingErrorHandler;
}
