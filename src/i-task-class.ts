import { ISqsWorkerConfig } from './i-sqs-worker-config';
import { Task } from './task';

export interface ITaskClass {
  type: string;
  workerConfig: ISqsWorkerConfig;
  new (): Task;
}
