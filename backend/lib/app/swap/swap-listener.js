"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSwapOutCompleted = void 0;
const admin_1 = require("../../services/ledger/admin");
const shared_1 = require("../../domain/shared");
const swap_1 = require("../../domain/swap");
const tracing_1 = require("../../services/tracing");
const errors_1 = require("../../domain/errors");
const handleSwapOutCompleted = async (swapStatus) => {
    if (swapStatus.parsedSwapData) {
        const type = swapStatus.parsedSwapData.swapType;
        const onchainMinerFee = {
            amount: BigInt(swapStatus.parsedSwapData.onchainMinerFee),
            currency: shared_1.WalletCurrency.Btc,
        };
        const offchainRoutingFee = {
            amount: BigInt(swapStatus.parsedSwapData.offchainRoutingFee),
            currency: shared_1.WalletCurrency.Btc,
        };
        const serviceProviderFee = {
            amount: BigInt(swapStatus.parsedSwapData.serviceProviderFee),
            currency: shared_1.WalletCurrency.Btc,
        };
        const totalFees = onchainMinerFee.amount + offchainRoutingFee.amount + serviceProviderFee.amount;
        const state = swapStatus.parsedSwapData.state;
        (0, tracing_1.addAttributesToCurrentSpan)({
            "swap.handler.state": state,
            "swap.handler.type": type,
            "swap.handler.onchainMinerFee": Number(onchainMinerFee.amount),
            "swap.handler.offchainRoutingFee": Number(offchainRoutingFee.amount),
            "swap.handler.serviceProviderFee": Number(serviceProviderFee.amount),
            "swap.handler.totalFees": Number(totalFees),
        });
        if (type === swap_1.SwapType.Swapout && state === swap_1.SwapState.Success && totalFees > 0n) {
            const journalResponse = await admin_1.admin.addSwapFeeTxSend(swapStatus.parsedSwapData);
            if (journalResponse instanceof errors_1.DuplicateError)
                return;
            (0, tracing_1.addAttributesToCurrentSpan)({
                "swap.handler.success": JSON.stringify(journalResponse),
            });
        }
        if (state === swap_1.SwapState.Failed) {
            (0, tracing_1.addAttributesToCurrentSpan)({
                "swap.error": JSON.stringify({
                    "swap.handler.errorMsg": swapStatus.parsedSwapData.message,
                    "swap.handler.errorSwapId": swapStatus.parsedSwapData.id,
                    "swap.handler.errorAmt": Number(swapStatus.parsedSwapData.amt),
                }),
            });
        }
    }
};
exports.handleSwapOutCompleted = handleSwapOutCompleted;
//# sourceMappingURL=swap-listener.js.map