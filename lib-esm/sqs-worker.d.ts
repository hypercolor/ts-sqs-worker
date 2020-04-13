import { ISqsWorkerConfig } from "./i-sqs-worker-config";
import { ISqsWorkerTaskResult } from "./i-sqs-worker-task-result";
import { ITaskClass } from "./i-task-class";
import { Task } from './task';
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
