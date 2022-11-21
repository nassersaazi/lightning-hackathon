"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapOut = void 0;
const _config_1 = require("../../config/index");
const onchain_1 = require("../../domain/bitcoin/onchain");
const errors_1 = require("../../domain/swap/errors");
const onchain_service_1 = require("../../services/lnd/onchain-service");
const swap_1 = require("../../domain/swap");
const logger_1 = require("../../services/logger");
const loopd_1 = require("../../services/loopd");
const tracing_1 = require("../../services/tracing");
const lnd_1 = require("../../services/lnd");
const shared_1 = require("../../domain/shared");
const get_active_loopd_1 = require("./get-active-loopd");
const get_swap_dest_address_1 = require("./get-swap-dest-address");
const logger = logger_1.baseLogger.child({ module: "swap" });
const swapOut = async () => {
    (0, tracing_1.addAttributesToCurrentSpan)({
        "swap.event": "started",
    });
    const activeLoopdConfig = (0, get_active_loopd_1.getActiveLoopd)();
    const swapService = (0, loopd_1.LoopService)(activeLoopdConfig);
    if (!swapService.healthCheck())
        return new errors_1.SwapServiceError("Failed health check");
    const onChainService = (0, onchain_service_1.OnChainService)((0, onchain_1.TxDecoder)(_config_1.BTC_NETWORK));
    if (onChainService instanceof Error)
        return onChainService;
    const onChainBalance = await onChainService.getBalance();
    if (onChainBalance instanceof Error)
        return onChainBalance;
    const offChainService = (0, lnd_1.LndService)();
    if (offChainService instanceof Error)
        return offChainService;
    const offChainChannelBalances = await offChainService.getInboundOutboundBalance();
    if (offChainChannelBalances instanceof Error)
        return offChainChannelBalances;
    const outbound = offChainChannelBalances.outbound;
    const loopOutWhenHotWalletLessThanConfig = (0, _config_1.getSwapConfig)().loopOutWhenHotWalletLessThan;
    const swapChecker = (0, swap_1.SwapOutChecker)({
        loopOutWhenHotWalletLessThanConfig,
        swapOutAmount: (0, _config_1.getSwapConfig)().swapOutAmount,
    });
    const swapOutAmount = swapChecker.getSwapOutAmount({
        currentOnChainHotWalletBalance: {
            amount: BigInt(onChainBalance),
            currency: shared_1.WalletCurrency.Btc,
        },
        currentOutboundLiquidityBalance: {
            amount: BigInt(outbound),
            currency: shared_1.WalletCurrency.Btc,
        },
    });
    const swapNoOp = {
        noOp: true,
        htlcAddress: "",
        serverMessage: "",
        swapId: "",
        swapIdBytes: "",
    };
    if (swapOutAmount.amount === 0n)
        return swapNoOp;
    const hasEnoughOutboundLiquidity = outbound > swapOutAmount.amount;
    if (!hasEnoughOutboundLiquidity) {
        (0, tracing_1.addAttributesToCurrentSpan)({
            "swap.checker.message": "Not enough outbound liquidity to perform swap out",
            "swap.checker.outboundAmountNeeded": Number(swapOutAmount.amount),
            "swap.checker.currentOutboundBalance": outbound,
        });
        return swapNoOp;
    }
    logger.info({ swapOutAmount, activeLoopdConfig }, `Initiating swapout`);
    (0, tracing_1.addAttributesToCurrentSpan)({
        "swap.amount": Number(swapOutAmount.amount),
    });
    const swapDestAddress = await (0, get_swap_dest_address_1.getSwapDestAddress)();
    if (swapDestAddress instanceof Error)
        return swapDestAddress;
    const swapResult = await swapService.swapOut({
        amount: swapOutAmount,
        swapDestAddress,
    });
    if (swapResult instanceof Error) {
        (0, tracing_1.addAttributesToCurrentSpan)({
            "swap.error": JSON.stringify(swapResult),
        });
    }
    else {
        (0, tracing_1.addAttributesToCurrentSpan)({
            "swap.submitted": JSON.stringify(swapResult),
        });
    }
    return swapResult;
};
exports.swapOut = swapOut;
//# sourceMappingURL=swap-out.js.map