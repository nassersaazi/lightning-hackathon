"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnChainBalance = exports.getClosingChannelBalance = exports.getOpeningChannelBalance = exports.getOffChainBalance = exports.getTotalBalance = void 0;
const _config_1 = require("../../config/index");
const bitcoin_1 = require("../../domain/bitcoin");
const cache_1 = require("../../domain/cache");
const shared_1 = require("../../domain/shared");
const onchain_1 = require("../../domain/bitcoin/onchain");
const lnd_1 = require("../../services/lnd");
const cache_2 = require("../../services/cache");
const onchain_service_1 = require("../../services/lnd/onchain-service");
const tracing_1 = require("../../services/tracing");
const cache = (0, cache_2.LocalCacheService)();
const getTotalBalance = async () => {
    const balances = await Promise.all([
        (0, exports.getOnChainBalance)(),
        (0, exports.getOffChainBalance)(),
        (0, exports.getOpeningChannelBalance)(),
        (0, exports.getClosingChannelBalance)(),
    ]);
    return sumBalances(balances);
};
exports.getTotalBalance = getTotalBalance;
const getOffChainBalance = async () => cache.getOrSet({
    key: cache_1.CacheKeys.OffChainBalance,
    ttlSecs: _config_1.SECS_PER_MIN,
    getForCaching: async () => {
        const offChainService = (0, lnd_1.LndService)();
        if (offChainService instanceof Error)
            return offChainService;
        const balances = await Promise.all(offChainService
            .listActivePubkeys()
            .map((pubkey) => offChainService.getBalance(pubkey)));
        return sumBalances(balances);
    },
});
exports.getOffChainBalance = getOffChainBalance;
const getOpeningChannelBalance = async () => cache.getOrSet({
    key: cache_1.CacheKeys.OpeningChannelBalance,
    ttlSecs: _config_1.SECS_PER_MIN,
    getForCaching: async () => {
        const offChainService = (0, lnd_1.LndService)();
        if (offChainService instanceof Error)
            return offChainService;
        const balances = await Promise.all(offChainService
            .listActivePubkeys()
            .map((pubkey) => offChainService.getOpeningChannelsBalance(pubkey)));
        return sumBalances(balances);
    },
});
exports.getOpeningChannelBalance = getOpeningChannelBalance;
const getClosingChannelBalance = async () => cache.getOrSet({
    key: cache_1.CacheKeys.ClosingChannelBalance,
    ttlSecs: _config_1.SECS_PER_MIN,
    getForCaching: async () => {
        const offChainService = (0, lnd_1.LndService)();
        if (offChainService instanceof Error)
            return offChainService;
        const balances = await Promise.all(offChainService
            .listActivePubkeys()
            .map((pubkey) => offChainService.getClosingChannelsBalance(pubkey)));
        return sumBalances(balances);
    },
});
exports.getClosingChannelBalance = getClosingChannelBalance;
const getOnChainBalance = async () => cache.getOrSet({
    key: cache_1.CacheKeys.OnChainBalance,
    ttlSecs: _config_1.SECS_PER_MIN,
    getForCaching: async () => {
        const onChainService = (0, onchain_service_1.OnChainService)((0, onchain_1.TxDecoder)(_config_1.BTC_NETWORK));
        if (onChainService instanceof Error)
            return onChainService;
        const onChainBalances = await Promise.all(onChainService
            .listActivePubkeys()
            .map((pubkey) => onChainService.getBalance(pubkey)));
        const onChain = sumBalances(onChainBalances);
        const onChainPendingBalances = await Promise.all(onChainService
            .listActivePubkeys()
            .map((pubkey) => onChainService.getPendingBalance(pubkey)));
        const onChainPending = sumBalances(onChainPendingBalances);
        return (0, bitcoin_1.toSats)(onChain + onChainPending);
    },
});
exports.getOnChainBalance = getOnChainBalance;
const sumBalances = (balances) => {
    const total = balances.reduce((total, b) => {
        if (b instanceof Error) {
            (0, tracing_1.recordExceptionInCurrentSpan)({ error: b, level: shared_1.ErrorLevel.Critical });
            return total;
        }
        return total + b;
    }, 0);
    return (0, bitcoin_1.toSats)(total);
};
//# sourceMappingURL=get-balances.js.map