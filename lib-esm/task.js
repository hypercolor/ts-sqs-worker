import { Credentials } from 'aws-sdk';
import * as SQS from 'aws-sdk/clients/sqs';
export class Task {
    submit() {
        const config = this.constructor.workerConfig;
        if (!config) {
            return Promise.reject(new Error('Worker config not set for task ' + this.constructor.name + ', was it registered with a SqsWorkerSubmitter?'));
        }
        else {
            const body = JSON.stringify({
                type: this.constructor.name,
                parameters: this,
            });
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
    }
}
//# sourceMappingURL=task.js.map