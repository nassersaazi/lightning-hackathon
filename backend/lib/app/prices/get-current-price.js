"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentPrice = void 0;
const cache_1 = require("../../domain/cache");
const primitives_1 = require("../../domain/primitives");
const price_1 = require("../../services/price");
const cache_2 = require("../../services/cache");
const price_2 = require("../../domain/price");
const getCurrentPrice = async () => {
    const realtimePrice = await (0, price_1.PriceService)().getRealTimePrice();
    if (realtimePrice instanceof Error)
        return getCachedPrice();
    // keep price in cache for 10 mins in case the price pod is not online
    await (0, cache_2.LocalCacheService)().set({
        key: cache_1.CacheKeys.CurrentPrice,
        value: realtimePrice,
        ttlSecs: (0, primitives_1.toSeconds)(600),
    });
    return realtimePrice;
};
exports.getCurrentPrice = getCurrentPrice;
const getCachedPrice = async () => {
    const cachedPrice = await (0, cache_2.LocalCacheService)().get({
        key: cache_1.CacheKeys.CurrentPrice,
    });
    if (cachedPrice instanceof Error)
        return new price_2.PriceNotAvailableError();
    return cachedPrice;
};
//# sourceMappingURL=get-current-price.js.map