"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockService = exports.redlock = void 0;
const redlock_1 = __importStar(require("redlock"));
const lock_1 = require("../../domain/lock");
const tracing_1 = require("../tracing");
const redis_1 = require("../redis");
const _config_1 = require("../../config/index");
// the maximum amount of time you want the resource to initially be locked,
// note: with redlock 5, the lock is automatically extended
const ttl = _config_1.BTC_NETWORK !== "regtest" ? 180000 : 10000;
const redlockClient = new redlock_1.default(
// you should have one client for each independent redis node
// or cluster
[redis_1.redis], {
    // the expected clock drift; for more details
    // see http://redis.io/topics/distlock
    driftFactor: 0.01,
    // the max number of times Redlock will attempt
    // to lock a resource before erroring
    retryCount: 3,
    // the time in ms between attempts
    retryDelay: 400,
    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200,
    // The minimum remaining time on a lock before an extension is automatically
    // attempted with the `using` API.
    automaticExtensionThreshold: 2500, // time in ms
});
const getWalletLockResource = (path) => `locks:wallet:${path}`;
const getPaymentHashLockResource = (path) => `locks:paymenthash:${path}`;
const getOnChainTxHashLockResource = (path) => `locks:onchaintxhash:${path}`;
const redlock = async ({ path, signal, asyncFn, }) => {
    if (signal) {
        if (signal.aborted) {
            return new lock_1.ResourceExpiredLockServiceError(signal.error?.message);
        }
        return asyncFn(signal);
    }
    try {
        return await redlockClient.using([path], ttl, async (signal) => asyncFn(signal));
    }
    catch (error) {
        if (error instanceof redlock_1.ExecutionError) {
            return new lock_1.ResourceAttemptsLockServiceError();
        }
        return new lock_1.UnknownLockServiceError();
    }
};
exports.redlock = redlock;
const LockService = () => {
    const lockWalletId = async (walletId, asyncFn) => {
        const path = getWalletLockResource(walletId);
        return (0, exports.redlock)({ path, asyncFn });
    };
    const lockPaymentHash = async (paymentHash, asyncFn) => {
        const path = getPaymentHashLockResource(paymentHash);
        return (0, exports.redlock)({ path, asyncFn });
    };
    const lockOnChainTxHash = async (txHash, asyncFn) => {
        const path = getOnChainTxHashLockResource(txHash);
        return (0, exports.redlock)({ path, asyncFn });
    };
    return (0, tracing_1.wrapAsyncFunctionsToRunInSpan)({
        namespace: "services.lock",
        fns: {
            lockWalletId,
            lockPaymentHash,
            lockOnChainTxHash,
        },
    });
};
exports.LockService = LockService;
//# sourceMappingURL=index.js.map