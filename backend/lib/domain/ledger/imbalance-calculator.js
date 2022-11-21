"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImbalanceCalculator = void 0;
const bitcoin_1 = require("../bitcoin");
const wallets_1 = require("../wallets");
const MS_PER_HOUR = (60 * 60 * 1000);
const MS_PER_DAY = (24 * MS_PER_HOUR);
const ImbalanceCalculator = ({ method, volumeLightningFn, volumeOnChainFn, sinceDaysAgo, }) => {
    const since = new Date(new Date().getTime() - sinceDaysAgo * MS_PER_DAY);
    const getNetInboundFlow = async ({ volumeFn, walletId, since, }) => {
        const volume_ = await volumeFn({
            walletId,
            timestamp: since,
        });
        if (volume_ instanceof Error)
            return volume_;
        return (0, bitcoin_1.toSats)(volume_.incomingBaseAmount - volume_.outgoingBaseAmount);
    };
    const getSwapOutImbalance = async (walletId) => {
        if (method === wallets_1.WithdrawalFeePriceMethod.flat)
            return 0;
        const lnNetInbound = await getNetInboundFlow({
            since,
            walletId,
            volumeFn: volumeLightningFn,
        });
        if (lnNetInbound instanceof Error)
            return lnNetInbound;
        const onChainNetInbound = await getNetInboundFlow({
            since,
            walletId,
            volumeFn: volumeOnChainFn,
        });
        if (onChainNetInbound instanceof Error)
            return onChainNetInbound;
        return (lnNetInbound - onChainNetInbound);
    };
    return {
        getSwapOutImbalance,
    };
};
exports.ImbalanceCalculator = ImbalanceCalculator;
//# sourceMappingURL=imbalance-calculator.js.map