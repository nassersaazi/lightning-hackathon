"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapOutChecker = void 0;
const shared_1 = require("../shared");
const SwapOutChecker = ({ loopOutWhenHotWalletLessThanConfig, swapOutAmount, }) => {
    // checks the amount of "swap out" that is need
    // if return "0" then no swap out needed
    // if return an "amount" then swapout needed
    const getSwapOutAmount = ({ currentOnChainHotWalletBalance, currentOutboundLiquidityBalance, }) => {
        const isOnChainWalletDepleted = currentOnChainHotWalletBalance.amount < loopOutWhenHotWalletLessThanConfig.amount;
        const hasEnoughOutboundLiquidity = currentOutboundLiquidityBalance.amount > swapOutAmount.amount;
        if (!hasEnoughOutboundLiquidity)
            return shared_1.ZERO_SATS;
        if (isOnChainWalletDepleted && hasEnoughOutboundLiquidity)
            return swapOutAmount;
        return shared_1.ZERO_SATS;
    };
    return {
        getSwapOutAmount,
    };
};
exports.SwapOutChecker = SwapOutChecker;
//# sourceMappingURL=swap-out-checker.js.map