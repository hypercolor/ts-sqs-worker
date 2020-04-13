import { Credentials } from 'aws-sdk';
import * as SQS from 'aws-sdk/clients/sqs';
var Task = /** @class */ (function () {
    function Task() {
    }
    Task.prototype.submit = function () {
        var config = this.constructor.workerConfig;
        if (!config) {
            return Promise.reject(new Error('Worker config not set for task ' + this.constructor.name + ', was it registered with a SqsWorkerSubmitter?'));
        }
        else {
            var body = JSON.stringify(Object.assign({}, this, { type: this.constructor.name }));
            if (config.verbose) {
                console.log('Submitting task: ' +
                    config.sqsUrl +
                    ' region: ' +
                    config.region +
                    ', creds: ' +
                    config.accessKeyId +
                    ' / ...' +
                    config.secretAccessKey.substring(config.secretAccessKey.length - 6) +
                    ' body: ' +
                    body);
            }
            return new SQS({
                credentials: new Credentials(config.accessKeyId, config.secretAccessKey),
                region: config.region,
            })
                .sendMessage({
                DelaySeconds: 0,
                MessageAttributes: {
                    type: {
                        DataType: 'String',
                        StringValue: this.constructor.name,
                    },
                },
                MessageBody: body,
                QueueUrl: config.sqsUrl,
            })
                .promise();
        }
    };
    return Task;
}());
export { Task };
//# sourceMappingURL=task.js.map