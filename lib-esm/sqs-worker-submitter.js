export class SqsWorkerSubmitter {
    constructor(config) {
        this.config = config;
    }
    registerTasksForSubmitting(taskTypes) {
        taskTypes.forEach(taskType => {
            this.registerTaskForSubmitting(taskType);
        });
        return this;
    }
    registerTaskForSubmitting(taskType) {
        taskType.workerConfig = this.config;
        return this;
    }
}
//# sourceMappingURL=sqs-worker-submitter.js.map