"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnChainTxs = void 0;
const _config_1 = require("../../../config/index");
const onchain_1 = require("../../../domain/bitcoin/onchain");
const cache_1 = require("../../../domain/cache");
const cache_2 = require("../../../services/cache");
const onchain_service_1 = require("../../../services/lnd/onchain-service");
const logger_1 = require("../../../services/logger");
// we are getting both the transactions in the mempool and the transaction that
// have been mined by not yet credited because they haven't reached enough confirmations
const getOnChainTxs = async () => (0, cache_2.RedisCacheService)().getOrSet({
    key: cache_1.CacheKeys.LastOnChainTransactions,
    ttlSecs: _config_1.SECS_PER_10_MINS,
    getForCaching: async () => {
        const onChain = (0, onchain_service_1.OnChainService)((0, onchain_1.TxDecoder)(_config_1.BTC_NETWORK));
        if (onChain instanceof onchain_1.OnChainError) {
            logger_1.baseLogger.warn({ onChain }, "impossible to create OnChainService");
            return onChain;
        }
        return onChain.listIncomingTransactions(_config_1.ONCHAIN_MIN_CONFIRMATIONS);
    },
    inflate: async (txnsPromise) => {
        const txns = await txnsPromise;
        if (txns instanceof Error)
            return txns;
        return txns.map(inflateIncomingOnChainTxFromCache);
    },
});
exports.getOnChainTxs = getOnChainTxs;
const inflateIncomingOnChainTxFromCache = (txn) => ({
    ...txn,
    createdAt: new Date(txn.createdAt),
    uniqueAddresses: () => (0, onchain_1.uniqueAddressesForTxn)(txn.rawTx),
});
//# sourceMappingURL=get-on-chain-txs.js.map