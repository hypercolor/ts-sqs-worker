import * as SQS from 'aws-sdk/clients/sqs'
import * as Consumer from 'sqs-consumer'
import { ITaskClass, Task } from './task'
import { TaskRouter } from './task-router'

export interface ISqsWorkerConfig {
  sqsUrl: string
}

export type SqsWorkerSuccessfulTaskCallback = (task: Task, result: any) => void
export type SqsWorkerFailedTaskCallback = (task: Task, error: any) => void

export class SqsWorker {
  private consumer: Consumer

  constructor(
    public config: ISqsWorkerConfig,
    successCallback?: SqsWorkerSuccessfulTaskCallback,
    failCallback?: SqsWorkerFailedTaskCallback
  ) {
    this.consumer = Consumer.create({
      queueUrl: config.sqsUrl,
      handleMessage: this.buildMessageHandler(successCallback, failCallback),
    })

    this.consumer.on('error', SqsWorker.errorHandler)
    this.consumer.on('processing_error', SqsWorker.processingErrorHandler)
  }

  public registerTasksForProcessing(taskTypes: Array<ITaskClass>) {
    taskTypes.forEach(taskType => {
      TaskRouter.registerTask(taskType)

      taskType.workerConfig = this.config
    })
  }

  private buildMessageHandler(
    successCallback?: SqsWorkerSuccessfulTaskCallback,
    failCallback?: SqsWorkerFailedTaskCallback
  ) {
    return async (message: SQS.Message) => {
      // do some work with `message`

      const start = new Date().getTime()

      let task: Task

      TaskRouter.deserializeTask(message)
        .then(t => {
          task = t
          return task.doTaskWork()
        })
        .then(result => {
          if (result && result.error) {
            console.log(
              'Job ' + task.constructor.name + ' (' + message.MessageId + ') error: ' + JSON.stringify(result.error)
            )

            return Promise.reject(result.error)

            // job.remove()
            // done(result.error)
          } else {
            let msg = task.constructor.name + '[' + message.MessageId + '] ' + (new Date().getTime() - start) + ' ms'

            if (result && result.message) {
              msg += ': ' + result.message
            }
            console.log(msg)

            // job.remove()
            if (successCallback) {
              successCallback(task, result)
            }
            return Promise.resolve()
          }
        })
        .catch(err => {
          console.log('Job ' + task.constructor.name + ' (' + message.MessageId + ') error: ', err)
          // job.remove()
          if (failCallback) {
            failCallback(task, err)
          }
          return Promise.reject(err)
          // done(err)
        })
    }
  }

  private static errorHandler(err: any) {
    console.error('ts-sqs-worker: There was an error in the sqs task')
    console.error(err)
    console.error(err.stack)
  }

  private static processingErrorHandler(err: any) {
    console.error('ts-sqs-worker: There was a processing_error in the sqs task')
    console.error(err)
    console.error(err.stack)
  }
}
