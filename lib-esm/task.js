import * as SQS from 'aws-sdk/clients/sqs';
export class Task {
    submit() {
        const config = this.constructor.workerConfig;
        if (!config) {
            return Promise.reject(new Error('Worker config not set for task ' + this.constructor.name + ', was it registered with a SqsWorkerSubmitter?'));
        }
        else {
            return new SQS()
                .sendMessage({
                DelaySeconds: 0,
                MessageAttributes: {
                    type: {
                        DataType: 'String',
                        StringValue: this.constructor.name,
                    },
                },
                MessageBody: JSON.stringify(this.serialize()),
                QueueUrl: config.sqsUrl,
            })
                .promise();
        }
    }
}
//# sourceMappingURL=task.js.map