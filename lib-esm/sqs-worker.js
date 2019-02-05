import * as Consumer from 'sqs-consumer';
import { TaskRouter } from './task-router';
export class SqsWorker {
    constructor(config, successCallback, failCallback) {
        this.config = config;
        this.consumer = Consumer.create({
            queueUrl: config.sqsUrl,
            handleMessage: this.buildMessageHandler(successCallback, failCallback)
        });
        this.consumer.on('error', SqsWorker.errorHandler);
        this.consumer.on('processing_error', SqsWorker.processingErrorHandler);
    }
    registerTasksForProcessing(taskTypes) {
        taskTypes.forEach(taskType => {
            TaskRouter.registerTask(taskType);
            taskType.workerConfig = this.config;
        });
    }
    buildMessageHandler(successCallback, failCallback) {
        return async (message) => {
            // do some work with `message`
            const start = new Date().getTime();
            let task;
            TaskRouter.deserializeTask(message)
                .then(t => {
                task = t;
                return task.doTaskWork();
            })
                .then(result => {
                if (result && result.error) {
                    console.log('Job ' + task.constructor.name + ' (' + message.MessageId + ') error: ' + JSON.stringify(result.error));
                    return Promise.reject(result.error);
                    // job.remove()
                    // done(result.error)
                }
                else {
                    let msg = task.constructor.name + '[' + message.MessageId + '] ' + (new Date().getTime() - start) + ' ms';
                    if (result && result.message) {
                        msg += ': ' + result.message;
                    }
                    console.log(msg);
                    // job.remove()
                    if (successCallback) {
                        successCallback(task, result);
                    }
                    return Promise.resolve();
                }
            })
                .catch(err => {
                console.log('Job ' + task.constructor.name + ' (' + message.MessageId + ') error: ', err);
                // job.remove()
                if (failCallback) {
                    failCallback(task, err);
                }
                return Promise.reject(err);
                // done(err)
            });
        };
    }
    static errorHandler(err) {
        console.error('ts-sqs-worker: There was an error in the sqs task');
        console.error(err);
        console.error(err.stack);
    }
    static processingErrorHandler(err) {
        console.error('ts-sqs-worker: There was a processing_error in the sqs task');
        console.error(err);
        console.error(err.stack);
    }
}
//# sourceMappingURL=sqs-worker.js.map