"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNoAmountLightningFeeEstimation = exports.getLightningFeeEstimation = void 0;
const lightning_1 = require("../../domain/bitcoin/lightning");
const wallets_1 = require("../../domain/wallets");
const payments_1 = require("../../domain/payments");
const lnd_1 = require("../../services/lnd");
const mongoose_1 = require("../../services/mongoose");
const dealer_price_1 = require("../../services/dealer-price");
const tracing_1 = require("../../services/tracing");
const partial_result_1 = require("../partial-result");
const helpers_1 = require("./helpers");
const getLightningFeeEstimation = async ({ walletId, uncheckedPaymentRequest, }) => {
    const decodedInvoice = (0, lightning_1.decodeInvoice)(uncheckedPaymentRequest);
    if (decodedInvoice instanceof Error)
        return partial_result_1.PartialResult.err(decodedInvoice);
    if (decodedInvoice.paymentAmount === null) {
        return partial_result_1.PartialResult.err(new payments_1.LnPaymentRequestNonZeroAmountRequiredError());
    }
    return estimateLightningFee({
        uncheckedSenderWalletId: walletId,
        invoice: decodedInvoice,
    });
};
exports.getLightningFeeEstimation = getLightningFeeEstimation;
const getNoAmountLightningFeeEstimation = async ({ walletId, uncheckedPaymentRequest, amount, }) => {
    const decodedInvoice = (0, lightning_1.decodeInvoice)(uncheckedPaymentRequest);
    if (decodedInvoice instanceof Error)
        return partial_result_1.PartialResult.err(decodedInvoice);
    const { amount: lnInvoiceAmount } = decodedInvoice;
    if (lnInvoiceAmount && lnInvoiceAmount > 0) {
        return partial_result_1.PartialResult.err(new payments_1.LnPaymentRequestZeroAmountRequiredError());
    }
    return estimateLightningFee({
        uncheckedSenderWalletId: walletId,
        invoice: decodedInvoice,
        uncheckedAmount: amount,
    });
};
exports.getNoAmountLightningFeeEstimation = getNoAmountLightningFeeEstimation;
const estimateLightningFee = async ({ uncheckedSenderWalletId, invoice, uncheckedAmount, }) => {
    const senderWalletId = (0, wallets_1.checkedToWalletId)(uncheckedSenderWalletId);
    if (senderWalletId instanceof Error)
        return partial_result_1.PartialResult.err(senderWalletId);
    const senderWallet = await (0, mongoose_1.WalletsRepository)().findById(senderWalletId);
    if (senderWallet instanceof Error)
        return partial_result_1.PartialResult.err(senderWallet);
    const dealer = (0, dealer_price_1.NewDealerPriceService)();
    const builder = await (0, helpers_1.constructPaymentFlowBuilder)({
        senderWallet,
        invoice,
        uncheckedAmount,
        hedgeBuyUsd: {
            usdFromBtc: dealer.getCentsFromSatsForFutureBuy,
            btcFromUsd: dealer.getSatsFromCentsForFutureBuy,
        },
        hedgeSellUsd: {
            usdFromBtc: dealer.getCentsFromSatsForFutureSell,
            btcFromUsd: dealer.getSatsFromCentsForFutureSell,
        },
    });
    if (builder instanceof Error)
        return partial_result_1.PartialResult.err(builder);
    const usdPaymentAmount = await builder.usdPaymentAmount();
    if (usdPaymentAmount instanceof Error)
        return partial_result_1.PartialResult.err(usdPaymentAmount);
    const btcPaymentAmount = await builder.btcPaymentAmount();
    if (btcPaymentAmount instanceof Error)
        return partial_result_1.PartialResult.err(btcPaymentAmount);
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.amount": btcPaymentAmount.amount.toString(),
        "payment.request.destination": invoice.destination,
        "payment.request.hash": invoice.paymentHash,
        "payment.request.description": invoice.description,
        "payment.request.expiresAt": invoice.expiresAt
            ? invoice.expiresAt.toISOString()
            : "undefined",
    });
    const priceRatio = (0, payments_1.PriceRatio)({ usd: usdPaymentAmount, btc: btcPaymentAmount });
    if (priceRatio instanceof Error)
        return partial_result_1.PartialResult.err(priceRatio);
    let paymentFlow;
    if (await builder.isTradeIntraAccount()) {
        const limitCheck = await (0, helpers_1.newCheckTradeIntraAccountLimits)({
            amount: usdPaymentAmount,
            wallet: senderWallet,
            priceRatio,
        });
        if (limitCheck instanceof Error)
            return partial_result_1.PartialResult.err(limitCheck);
        paymentFlow = await builder.withoutRoute();
    }
    else if (await builder.isIntraLedger()) {
        const limitCheck = await (0, helpers_1.newCheckIntraledgerLimits)({
            amount: usdPaymentAmount,
            wallet: senderWallet,
            priceRatio,
        });
        if (limitCheck instanceof Error)
            return partial_result_1.PartialResult.err(limitCheck);
        paymentFlow = await builder.withoutRoute();
    }
    else {
        const limitCheck = await (0, helpers_1.newCheckWithdrawalLimits)({
            amount: usdPaymentAmount,
            wallet: senderWallet,
            priceRatio,
        });
        if (limitCheck instanceof Error)
            return partial_result_1.PartialResult.err(limitCheck);
        const lndService = (0, lnd_1.LndService)();
        if (lndService instanceof Error) {
            return partial_result_1.PartialResult.err(lndService);
        }
        const routeResult = (await builder.skipProbeForDestination())
            ? new payments_1.SkipProbeForPubkeyError()
            : await lndService.findRouteForInvoice({
                invoice,
                amount: btcPaymentAmount,
            });
        if (routeResult instanceof Error) {
            paymentFlow = await builder.withoutRoute();
            if (paymentFlow instanceof Error) {
                return partial_result_1.PartialResult.err(paymentFlow);
            }
            (0, mongoose_1.PaymentFlowStateRepository)(lightning_1.defaultTimeToExpiryInSeconds).persistNew(paymentFlow);
            return routeResult instanceof payments_1.SkipProbeForPubkeyError
                ? partial_result_1.PartialResult.ok(paymentFlow.protocolFeeInSenderWalletCurrency())
                : partial_result_1.PartialResult.partial(paymentFlow.protocolFeeInSenderWalletCurrency(), routeResult);
        }
        paymentFlow = await builder.withRoute(routeResult);
    }
    if (paymentFlow instanceof Error)
        return partial_result_1.PartialResult.err(paymentFlow);
    const persistedPayment = await (0, mongoose_1.PaymentFlowStateRepository)(lightning_1.defaultTimeToExpiryInSeconds).persistNew(paymentFlow);
    if (persistedPayment instanceof Error)
        return partial_result_1.PartialResult.partial(paymentFlow.protocolFeeInSenderWalletCurrency(), persistedPayment);
    return partial_result_1.PartialResult.ok(persistedPayment.protocolFeeInSenderWalletCurrency());
};
//# sourceMappingURL=get-protocol-fee.js.map