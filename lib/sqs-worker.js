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
import * as Consumer from 'sqs-consumer';
import { TaskRouter } from './task-router';
var SqsWorker = /** @class */ (function () {
    function SqsWorker(config, successCallback, failCallback) {
        this.config = config;
        this.consumer = Consumer.create({
            queueUrl: config.sqsUrl,
            handleMessage: this.buildMessageHandler(successCallback, failCallback)
        });
        this.consumer.on('error', SqsWorker.errorHandler);
        this.consumer.on('processing_error', SqsWorker.processingErrorHandler);
    }
    SqsWorker.prototype.registerTasksForProcessing = function (taskTypes) {
        var _this = this;
        taskTypes.forEach(function (taskType) {
            TaskRouter.registerTask(taskType);
            taskType.workerConfig = _this.config;
        });
    };
    SqsWorker.prototype.buildMessageHandler = function (successCallback, failCallback) {
        var _this = this;
        return function (message) { return __awaiter(_this, void 0, void 0, function () {
            var start, task;
            return __generator(this, function (_a) {
                start = new Date().getTime();
                TaskRouter.deserializeTask(message)
                    .then(function (t) {
                    task = t;
                    return task.doTaskWork();
                })
                    .then(function (result) {
                    if (result && result.error) {
                        console.log('Job ' + task.constructor.name + ' (' + message.MessageId + ') error: ' + JSON.stringify(result.error));
                        return Promise.reject(result.error);
                        // job.remove()
                        // done(result.error)
                    }
                    else {
                        var msg = task.constructor.name + '[' + message.MessageId + '] ' + (new Date().getTime() - start) + ' ms';
                        if (result && result.message) {
                            msg += ': ' + result.message;
                        }
                        console.log(msg);
                        // job.remove()
                        if (successCallback) {
                            successCallback(task, result);
                        }
                        return Promise.resolve();
                    }
                })
                    .catch(function (err) {
                    console.log('Job ' + task.constructor.name + ' (' + message.MessageId + ') error: ', err);
                    // job.remove()
                    if (failCallback) {
                        failCallback(task, err);
                    }
                    return Promise.reject(err);
                    // done(err)
                });
                return [2 /*return*/];
            });
        }); };
    };
    SqsWorker.errorHandler = function (err) {
        console.error('ts-sqs-worker: There was an error in the sqs task');
        console.error(err);
        console.error(err.stack);
    };
    SqsWorker.processingErrorHandler = function (err) {
        console.error('ts-sqs-worker: There was a processing_error in the sqs task');
        console.error(err);
        console.error(err.stack);
    };
    return SqsWorker;
}());
export { SqsWorker };
//# sourceMappingURL=sqs-worker.js.map