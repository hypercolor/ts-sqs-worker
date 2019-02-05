var SqsWorkerSubmitter = /** @class */ (function () {
    function SqsWorkerSubmitter(config) {
        this.config = config;
    }
    SqsWorkerSubmitter.prototype.registerTasksForSubmitting = function (taskTypes) {
        var _this = this;
        taskTypes.forEach(function (taskType) {
            _this.registerTaskForSubmitting(taskType);
        });
        return this;
    };
    SqsWorkerSubmitter.prototype.registerTaskForSubmitting = function (taskType) {
        taskType.workerConfig = this.config;
        return this;
    };
    return SqsWorkerSubmitter;
}());
export { SqsWorkerSubmitter };
//# sourceMappingURL=sqs-worker-submitter.js.map