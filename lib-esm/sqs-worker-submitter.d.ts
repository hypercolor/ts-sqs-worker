import { ISqsWorkerConfig } from './i-sqs-worker-config';
import { ITaskClass } from './i-task-class';
export declare class SqsWorkerSubmitter {
    private config;
    constructor(config: ISqsWorkerConfig);
    registerTasksForSubmitting(taskTypes: Array<ITaskClass>): this;
    registerTaskForSubmitting(taskType: ITaskClass): this;
}
