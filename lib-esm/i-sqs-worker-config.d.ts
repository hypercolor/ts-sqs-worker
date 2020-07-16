export interface ISqsWorkerConfig {
    sqsUrl: string;
    batchSize?: number;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    verbose?: boolean;
    debug?: boolean;
}
