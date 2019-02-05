import { ISqsWorkerConfig } from './sqs-worker';
import { ITaskClass } from './task';
export declare class SqsWorkerSubmitter {
    private config;
    constructor(config: ISqsWorkerConfig);
    registerTasksForSubmitting(taskTypes: Array<ITaskClass>): this;
    registerTaskForSubmitting(taskType: ITaskClass): this;
}
