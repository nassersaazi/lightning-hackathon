"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RebalanceChecker = void 0;
const bitcoin_1 = require("../bitcoin");
const RebalanceChecker = ({ minOnChainHotWalletBalance, minRebalanceSize, maxHotWalletBalance, }) => {
    const getWithdrawFromHotWalletAmount = ({ onChainHotWalletBalance, offChainHotWalletBalance, }) => {
        const totalHotWallet = onChainHotWalletBalance + offChainHotWalletBalance;
        if (totalHotWallet > maxHotWalletBalance) {
            const rebalanceAmount = onChainHotWalletBalance - minOnChainHotWalletBalance;
            if (rebalanceAmount > minRebalanceSize) {
                return (0, bitcoin_1.toSats)(rebalanceAmount);
            }
        }
        return (0, bitcoin_1.toSats)(0);
    };
    return {
        getWithdrawFromHotWalletAmount,
    };
};
exports.RebalanceChecker = RebalanceChecker;
//# sourceMappingURL=index.js.map