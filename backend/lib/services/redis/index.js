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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectAll = exports.redisCache = exports.redisCacheInstance = exports.redisPubSub = exports.redisSub = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const graphql_redis_subscriptions_1 = require("graphql-redis-subscriptions");
const ioredis_cache_1 = __importDefault(require("ioredis-cache"));
const logger_1 = require("../logger");
let connectionObj = {};
if (process.env.LOCAL === "docker-compose") {
    connectionObj = {
        name: process.env.REDIS_MASTER_NAME ?? "mymaster",
        host: process.env.REDIS_0_INTERNAL_IP,
        port: process.env.REDIS_0_PORT,
        password: process.env.REDIS_PASSWORD,
    };
}
else {
    connectionObj = {
        sentinelPassword: process.env.REDIS_PASSWORD,
        sentinels: [
            {
                host: `${process.env.REDIS_0_DNS}`,
                port: process.env.REDIS_0_SENTINEL_PORT || 26379,
            },
            {
                host: `${process.env.REDIS_1_DNS}`,
                port: process.env.REDIS_1_SENTINEL_PORT || 26379,
            },
            {
                host: `${process.env.REDIS_2_DNS}`,
                port: process.env.REDIS_2_SENTINEL_PORT || 26379,
            },
        ],
        name: process.env.REDIS_MASTER_NAME ?? "mymaster",
        password: process.env.REDIS_PASSWORD,
    };
}
exports.redis = new ioredis_1.default(connectionObj);
exports.redis.on("error", (err) => logger_1.baseLogger.error({ err }, "Redis error"));
exports.redisSub = new ioredis_1.default(connectionObj);
exports.redisSub.on("error", (err) => logger_1.baseLogger.error({ err }, "redisSub error"));
exports.redisPubSub = new graphql_redis_subscriptions_1.RedisPubSub({
    publisher: exports.redis,
    subscriber: exports.redisSub,
});
exports.redisCacheInstance = new ioredis_1.default(connectionObj);
exports.redisCacheInstance.on("error", (err) => logger_1.baseLogger.error({ err }, "redisCacheInstance error"));
exports.redisCache = new ioredis_cache_1.default(exports.redisCacheInstance);
const disconnectAll = () => {
    exports.redis.disconnect();
    exports.redisSub.disconnect();
    exports.redisCacheInstance.disconnect();
};
exports.disconnectAll = disconnectAll;
__exportStar(require("./routes"), exports);
//# sourceMappingURL=index.js.map