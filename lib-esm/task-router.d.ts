import * as SQS from 'aws-sdk/clients/sqs';
import { ITaskClass, Task } from './task';
export declare class TaskRouter {
    private static taskTypes;
    static registerTask(taskType: ITaskClass): void;
    static deserializeTask(message: SQS.Message): Promise<Task>;
}
