"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalCacheService = void 0;
const cache_1 = require("../../domain/cache");
const tracing_1 = require("../tracing");
const node_cache_1 = __importDefault(require("node-cache"));
const localCache = new node_cache_1.default();
const LocalCacheService = () => {
    const set = ({ key, value, ttlSecs, }) => {
        try {
            const res = localCache.set(key, value, ttlSecs);
            if (res)
                return Promise.resolve(value);
            return Promise.resolve(new cache_1.CacheNotAvailableError());
        }
        catch (err) {
            return Promise.resolve(new cache_1.UnknownCacheServiceError(err));
        }
    };
    const get = ({ key }) => {
        try {
            const value = localCache.get(key);
            if (value === undefined)
                return Promise.resolve(new cache_1.CacheUndefinedError());
            return Promise.resolve(value);
        }
        catch (err) {
            return Promise.resolve(new cache_1.UnknownCacheServiceError(err));
        }
    };
    const getOrSet = async ({ key, getForCaching, ttlSecs, }) => {
        const cachedData = await get({ key });
        if (!(cachedData instanceof Error))
            return cachedData;
        const data = await getForCaching();
        // Typescript can't parse 'ReturnType<F>' to filter out 'Error' types
        if (data instanceof Error)
            return data;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        set({ key, value: data, ttlSecs });
        return data;
    };
    const clear = ({ key }) => {
        try {
            localCache.del(key);
            return Promise.resolve(true);
        }
        catch (err) {
            return Promise.resolve(new cache_1.UnknownCacheServiceError(err));
        }
    };
    return (0, tracing_1.wrapAsyncFunctionsToRunInSpan)({
        namespace: "services.cache.local",
        fns: { set, get, getOrSet, clear },
    });
};
exports.LocalCacheService = LocalCacheService;
//# sourceMappingURL=local-cache.js.map