import { Mapper } from './mapper';
export class TaskFactory {
    static registerTask(taskType) {
        this.taskTypes[taskType.name] = taskType;
    }
    static async build(type, parameters, verbose) {
        type = type.trim();
        if (verbose) {
            console.log('ts-sqs-worker.TaskFactory: Building task: ' + type);
        }
        const taskType = this.taskTypes[type];
        if (!taskType) {
            throw new Error('Invalid task type: ' + type);
        }
        if (verbose) {
            console.log('ts-sqs-worker.TaskFactory: Got taskType: ', taskType);
        }
        const task = await Mapper.map(parameters, taskType);
        if (verbose) {
            console.log('ts-sqs-worker.TaskFactory: Built task: ', task);
        }
        return task;
    }
}
TaskFactory.taskTypes = {};
//# sourceMappingURL=task-factory.js.map