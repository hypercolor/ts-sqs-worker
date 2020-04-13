import { ISqsWorkerConfig } from './i-sqs-worker-config';
import { Task } from './task';

export interface ITaskClass {
  name: string;
  workerConfig: ISqsWorkerConfig;
  new (): Task;
}
