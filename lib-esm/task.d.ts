import * as SQS from 'aws-sdk/clients/sqs';
import { ISqsWorkerConfig } from './sqs-worker';
export interface ITaskClass {
    name: string;
    workerConfig: ISqsWorkerConfig;
    deserialize(serializedParams: any): Promise<Task>;
}
export declare abstract class Task {
    static workerConfig: ISqsWorkerConfig;
    abstract serialize(): any;
    abstract doTaskWork(): Promise<any>;
    submit(): Promise<import("aws-sdk/lib/request").PromiseResult<SQS.SendMessageResult, import("aws-sdk").AWSError>>;
}
