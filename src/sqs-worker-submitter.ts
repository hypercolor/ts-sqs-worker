import { ISqsWorkerConfig } from './sqs-worker'
import { ITaskClass } from './task'

export class SqsWorkerSubmitter {
  constructor(private config: ISqsWorkerConfig) {}

  public registerTasksForSubmitting(taskTypes: Array<ITaskClass>) {
    taskTypes.forEach(taskType => {
      this.registerTaskForSubmitting(taskType)
    })
    return this
  }

  public registerTaskForSubmitting(taskType: ITaskClass) {
    taskType.workerConfig = this.config
    return this
  }
}
