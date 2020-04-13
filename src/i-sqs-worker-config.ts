export interface ISqsWorkerConfig {
  sqsUrl: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  verbose?: boolean;
  debug?: boolean;
}
