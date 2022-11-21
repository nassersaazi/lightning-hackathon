"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceHistory = void 0;
const cache_1 = require("../../domain/cache");
const primitives_1 = require("../../domain/primitives");
const price_1 = require("../../services/price");
const price_2 = require("../../domain/price");
const cache_2 = require("../../services/cache");
const getPriceHistory = async ({ range, interval, }) => {
    const localCache = (0, cache_2.LocalCacheService)();
    const cacheKey = `${cache_1.CacheKeys.PriceHistory}:${range}-${interval}`;
    const cachedPriceHistory = await localCache.get({ key: cacheKey });
    if (!(cachedPriceHistory instanceof Error))
        return cachedPriceHistory;
    const priceHistory = await (0, price_1.PriceService)().listHistory({ range, interval });
    if (priceHistory instanceof Error)
        return priceHistory;
    if (priceHistory.length > 0) {
        // keep price history in cache for 5 mins
        await localCache.set({
            key: cacheKey,
            value: priceHistory,
            ttlSecs: (0, primitives_1.toSeconds)(300),
        });
        return priceHistory;
    }
    return new price_2.PriceHistoryNotAvailableError();
};
exports.getPriceHistory = getPriceHistory;
//# sourceMappingURL=get-price-history.js.map