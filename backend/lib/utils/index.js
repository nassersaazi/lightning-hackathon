"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifiedSet = exports.timestampDaysAgo = exports.checkedInteger = exports.elapsedSinceTimestamp = exports.mapObj = exports.runInParallel = exports.timeout = exports.sleep = void 0;
const _config_1 = require("../config/index");
const errors_1 = require("../domain/errors");
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function timeout(delay, msg) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error(msg));
        }, delay);
    });
}
exports.timeout = timeout;
/**
 * Process an iterator with N workers
 * @method async
 * @param  iterator iterator to process
 * @param  processor async function that process each item
 * @param  workers  number of workers to use. 5 by default
 * @param  logger  logger instance, just needed if you want to log processor errors
 * @return       Promise with all workers
 */
const runInParallel = ({ iterator, processor, logger, workers = 5, }) => {
    const runWorkerInParallel = async (items, index) => {
        for await (const item of items) {
            try {
                await processor(item, index);
            }
            catch (error) {
                logger.error({ item, error }, `issue with worker ${index}`);
            }
        }
    };
    // starts N workers sharing the same iterator, i.e. process N items in parallel
    const jobWorkers = new Array(workers).fill(iterator).map(runWorkerInParallel);
    return Promise.allSettled(jobWorkers);
};
exports.runInParallel = runInParallel;
const mapObj = (obj, fn) => {
    const mappedObj = {};
    for (const key in obj) {
        mappedObj[key] = fn(obj[key]);
    }
    return mappedObj;
};
exports.mapObj = mapObj;
const elapsedSinceTimestamp = (date) => {
    return ((Date.now() - Number(date)) / 1000);
};
exports.elapsedSinceTimestamp = elapsedSinceTimestamp;
const checkedInteger = (num) => Number.isInteger(num) ? num : new errors_1.NonIntegerError();
exports.checkedInteger = checkedInteger;
const timestampDaysAgo = (days) => {
    const check = (0, exports.checkedInteger)(days);
    return check instanceof Error ? check : new Date(Date.now() - days * _config_1.MS_PER_DAY);
};
exports.timestampDaysAgo = timestampDaysAgo;
class ModifiedSet extends Set {
    intersect(otherSet) {
        return new ModifiedSet(Array.from(this).filter((i) => otherSet.has(i)));
    }
}
exports.ModifiedSet = ModifiedSet;
//# sourceMappingURL=index.js.map