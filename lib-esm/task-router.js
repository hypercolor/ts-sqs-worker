export class TaskRouter {
    static registerTask(taskType) {
        this.taskTypes.push(taskType);
    }
    static deserializeTask(message) {
        let params;
        try {
            params = JSON.parse(message.Body);
        }
        catch (err) {
            return Promise.reject(err);
        }
        if (message.MessageAttributes && message.MessageAttributes.type) {
            const type = message.MessageAttributes.type.StringValue;
            for (const taskType of this.taskTypes) {
                if (type === taskType.name) {
                    return taskType.deserialize(params);
                }
            }
        }
        return Promise.reject(new Error('Couldn\'t match task type: ' + JSON.stringify(message.MessageAttributes)));
    }
}
TaskRouter.taskTypes = [];
//# sourceMappingURL=task-router.js.map