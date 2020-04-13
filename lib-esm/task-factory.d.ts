import { ITaskClass } from './i-task-class';
import { Task } from './task';
export declare class TaskFactory {
    private static taskTypes;
    static registerTask(taskType: ITaskClass): void;
    static build(type: string, parameters?: {
        [key: string]: any;
    }): Promise<Task>;
}
