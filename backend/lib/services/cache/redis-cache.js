"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheService = void 0;
const cache_1 = require("../../domain/cache");
const redis_1 = require("../redis");
const tracing_1 = require("../tracing");
const RedisCacheService = () => {
    const set = async ({ key, value, ttlSecs, }) => {
        try {
            const res = await redis_1.redisCache.setCache(key, value, ttlSecs);
            if (!res)
                return new cache_1.CacheNotAvailableError();
            return res;
        }
        catch (err) {
            return new cache_1.UnknownCacheServiceError(err.message || err);
        }
    };
    const get = async ({ key }) => {
        try {
            const value = await redis_1.redisCache.getCache(key);
            if (value === undefined)
                return new cache_1.CacheUndefinedError();
            return value;
        }
        catch (err) {
            return new cache_1.UnknownCacheServiceError(err.message || err);
        }
    };
    const getOrSet = async ({ key, ttlSecs, getForCaching, inflate, }) => {
        if (inflate) {
            const cachedData = await get({ key });
            if (!(cachedData instanceof Error))
                return inflate(cachedData);
        }
        else {
            const cachedData = await get({ key });
            if (!(cachedData instanceof Error))
                return cachedData;
        }
        const data = await getForCaching();
        // Typescript can't parse 'ReturnType<F>' to filter out 'Error' types
        if (data instanceof Error)
            return data;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        set({ key, value: data, ttlSecs });
        return data;
    };
    const clear = async ({ key, }) => {
        try {
            await redis_1.redisCache.deleteCache(key);
            return true;
        }
        catch (err) {
            return new cache_1.UnknownCacheServiceError(err.message || err);
        }
    };
    return (0, tracing_1.wrapAsyncFunctionsToRunInSpan)({
        namespace: "services.cache.redis",
        fns: { set, get, getOrSet, clear },
    });
};
exports.RedisCacheService = RedisCacheService;
//# sourceMappingURL=redis-cache.js.map