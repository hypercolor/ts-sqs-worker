import { Mapper } from "./mapper";
export class TaskFactory {
    static registerTask(taskType) {
        this.taskTypes[taskType.type] = taskType;
    }
    static async build(type, parameters) {
        if (type) {
            type = type.trim();
        }
        const taskType = this.taskTypes[type];
        if (!taskType) {
            throw new Error('Invalid task type: ' + type);
        }
        return Mapper.map(parameters, taskType);
    }
}
TaskFactory.taskTypes = {};
//# sourceMappingURL=task-factory.js.map