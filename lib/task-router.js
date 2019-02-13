var TaskRouter = /** @class */ (function () {
    function TaskRouter() {
    }
    TaskRouter.registerTask = function (taskType) {
        this.taskTypes.push(taskType);
    };
    TaskRouter.deserializeTask = function (message) {
        var params;
        try {
            params = JSON.parse(message.Body);
        }
        catch (err) {
            return Promise.reject(err);
        }
        if (message.MessageAttributes && message.MessageAttributes.type) {
            var type = message.MessageAttributes.type.StringValue;
            for (var _i = 0, _a = this.taskTypes; _i < _a.length; _i++) {
                var taskType = _a[_i];
                if (type === taskType.name) {
                    return taskType.deserialize(params);
                }
            }
        }
        return Promise.reject(new Error("Couldn't match task type: " + JSON.stringify(message.MessageAttributes)));
    };
    TaskRouter.taskTypes = [];
    return TaskRouter;
}());
export { TaskRouter };
//# sourceMappingURL=task-router.js.map