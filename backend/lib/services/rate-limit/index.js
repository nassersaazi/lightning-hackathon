"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetLimiter = exports.consumeLimiter = exports.RedisRateLimitService = void 0;
const errors_1 = require("../../domain/rate-limit/errors");
const redis_1 = require("../redis");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const RedisRateLimitService = ({ keyPrefix, limitOptions, }) => {
    const limiter = new rate_limiter_flexible_1.RateLimiterRedis({ storeClient: redis_1.redis, keyPrefix, ...limitOptions });
    const consume = async (key) => {
        try {
            await limiter.consume(key);
            return true;
        }
        catch (err) {
            return new errors_1.RateLimiterExceededError();
        }
    };
    const reset = async (key) => {
        try {
            await limiter.delete(key);
            return true;
        }
        catch (err) {
            return new errors_1.UnknownRateLimitServiceError(err);
        }
    };
    const reward = async (key) => {
        try {
            await limiter.reward(key);
            return true;
        }
        catch (err) {
            return new errors_1.UnknownRateLimitServiceError(err);
        }
    };
    return { consume, reset, reward };
};
exports.RedisRateLimitService = RedisRateLimitService;
const consumeLimiter = async ({ rateLimitConfig, keyToConsume, }) => {
    const limiter = (0, exports.RedisRateLimitService)({
        keyPrefix: rateLimitConfig.key,
        limitOptions: rateLimitConfig.limits,
    });
    const consume = await limiter.consume(keyToConsume);
    return consume instanceof Error ? new rateLimitConfig.error() : consume;
};
exports.consumeLimiter = consumeLimiter;
const resetLimiter = async ({ rateLimitConfig, keyToConsume, }) => {
    const limiter = (0, exports.RedisRateLimitService)({
        keyPrefix: rateLimitConfig.key,
        limitOptions: rateLimitConfig.limits,
    });
    return limiter.reset(keyToConsume);
};
exports.resetLimiter = resetLimiter;
//# sourceMappingURL=index.js.map