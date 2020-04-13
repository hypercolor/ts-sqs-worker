import * as SQS from 'aws-sdk/clients/sqs';
import { ISqsWorkerConfig } from "./i-sqs-worker-config";
import { ITaskResult } from "./i-task-result";
export declare abstract class Task {
    static workerConfig: ISqsWorkerConfig;
    abstract run(): Promise<ITaskResult | void>;
    submit(): Promise<import("aws-sdk/lib/request").PromiseResult<SQS.SendMessageResult, import("aws-sdk").AWSError>>;
}
