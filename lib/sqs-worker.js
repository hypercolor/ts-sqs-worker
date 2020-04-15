var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Credentials } from 'aws-sdk';
import * as SQS from 'aws-sdk/clients/sqs';
import * as Consumer from 'sqs-consumer';
import { TaskFactory } from './task-factory';
var SqsWorker = /** @class */ (function () {
    function SqsWorker(config, successCallback, failCallback) {
        var _this = this;
        this.config = config;
        if (!config || !config.sqsUrl || !config.accessKeyId || !config.secretAccessKey || !config.region) {
            throw new Error('Invalid SQS worker config: ' + JSON.stringify(config));
        }
        this.consumer = Consumer.create({
            queueUrl: config.sqsUrl,
            handleMessage: this.buildMessageHandler(successCallback, failCallback),
            sqs: new SQS({
                credentials: new Credentials(config.accessKeyId, config.secretAccessKey),
                region: config.region,
            }),
            messageAttributeNames: ['type'],
        });
        this.consumer.on('error', function (err) { return _this.errorHandler(err); });
        this.consumer.on('processing_error', function (err) { return _this.processingErrorHandler(err); });
    }
    SqsWorker.prototype.registerTasksForProcessingAndStartConsuming = function (taskTypes) {
        var _this = this;
        taskTypes.forEach(function (taskType) {
            if (_this.config.verbose) {
                console.log('ts-sqs-worker: registering task: ' + taskType.constructor.name);
            }
            taskType.workerConfig = _this.config;
            TaskFactory.registerTask(taskType);
        });
        this.consumer.start();
    };
    SqsWorker.prototype.buildMessageHandler = function (successCallback, failCallback) {
        var _this = this;
        return function (message) { return __awaiter(_this, void 0, void 0, function () {
            var start, bodyString, body, messageType, task, result, type, msg, err_1, type;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // do some work with `message`
                        if (this.config.debug) {
                            console.log('ts-sqs-worker: ' + 'message: ' + JSON.stringify(message));
                        }
                        start = new Date().getTime();
                        bodyString = message.Body;
                        if (!bodyString) {
                            throw new Error('Invalid message, no body: ' + JSON.stringify(message));
                        }
                        body = JSON.parse(bodyString);
                        messageType = body.type;
                        if (!messageType || typeof messageType !== 'string') {
                            throw new Error('Invalid message, message type not found or recognized: ' + JSON.stringify(body));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, TaskFactory.build(messageType, body.parameters)];
                    case 2:
                        task = _a.sent();
                        if (this.config.debug) {
                            console.log('built task: ', task);
                        }
                        return [4 /*yield*/, task.run()];
                    case 3:
                        result = _a.sent();
                        if (result && result.error) {
                            if (this.config.verbose) {
                                console.log('ts-sqs-worker: ' +
                                    'Job ' +
                                    task.constructor.name +
                                    ' (' +
                                    message.MessageId +
                                    ') error: ' +
                                    JSON.stringify(result.error));
                            }
                            type = 'unknown';
                            if (message.MessageAttributes && message.MessageAttributes.type) {
                                type = message.MessageAttributes.type.StringValue;
                            }
                            if (failCallback) {
                                failCallback(type, result.error);
                            }
                            throw result.error;
                        }
                        else {
                            if (this.config.verbose) {
                                msg = 'ts-sqs-worker: ' +
                                    task.constructor.name +
                                    '[' +
                                    message.MessageId +
                                    '] ' +
                                    (new Date().getTime() - start) +
                                    ' ms';
                                if (result && result.info) {
                                    msg += ': ' + result.info;
                                }
                                console.log(msg);
                            }
                            if (successCallback) {
                                successCallback(task, {
                                    durationMs: new Date().getTime() - start,
                                    taskResult: result,
                                });
                            }
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        if (this.config.verbose) {
                            console.log('ts-sqs-worker: ' + 'Job ' + messageType + ' (' + message.MessageId + ') error: ', err_1);
                        }
                        type = 'unknown';
                        if (message.MessageAttributes && message.MessageAttributes.type) {
                            type = message.MessageAttributes.type.StringValue;
                        }
                        if (failCallback) {
                            failCallback(type, err_1);
                        }
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
    };
    SqsWorker.prototype.errorHandler = function (err) {
        if (!this.config || this.config.verbose) {
            console.error('ts-sqs-worker: There was an error in the sqs task');
            console.error(err);
            console.error(err.stack);
        }
    };
    SqsWorker.prototype.processingErrorHandler = function (err) {
        if (!this.config || this.config.verbose) {
            console.error('ts-sqs-worker: There was a processing_error in the sqs task');
            console.error(err);
            console.error(err.stack);
        }
    };
    return SqsWorker;
}());
export { SqsWorker };
//# sourceMappingURL=sqs-worker.js.map