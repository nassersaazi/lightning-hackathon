"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentFlowStateRepository = void 0;
const errors_1 = require("../../domain/errors");
const payments_1 = require("../../domain/payments");
const shared_1 = require("../../domain/shared");
const safe_1 = require("../../domain/shared/safe");
const _utils_1 = require("../../utils/index");
const utils_1 = require("./utils");
const schema_1 = require("./schema");
const PaymentFlowStateRepository = (expiryTimeInSeconds) => {
    const persistNew = async (paymentFlow) => {
        try {
            const rawPaymentFlowState = rawFromPaymentFlow(paymentFlow);
            if (rawPaymentFlowState instanceof Error)
                return rawPaymentFlowState;
            const paymentFlowState = new schema_1.PaymentFlowState(rawPaymentFlowState);
            await paymentFlowState.save();
            return paymentFlowFromRaw(paymentFlowState);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findLightningPaymentFlow = async (args) => {
        const { walletId, paymentHash, intraLedgerHash, inputAmount } = args;
        const hash = paymentHash
            ? { paymentHash }
            : intraLedgerHash
                ? { intraLedgerHash }
                : new errors_1.BadInputsForFindError(JSON.stringify(args));
        if (hash instanceof Error)
            return hash;
        try {
            const result = await schema_1.PaymentFlowState.findOne({
                ...hash,
                senderWalletId: walletId,
                inputAmount: Number(inputAmount),
            });
            if (!result)
                return new errors_1.CouldNotFindLightningPaymentFlowError();
            const paymentFlow = paymentFlowFromRaw(result);
            if (paymentFlow instanceof Error)
                return paymentFlow;
            if (isExpired({ paymentFlow, expiryTimeInSeconds })) {
                deleteLightningPaymentFlow({ ...hash, walletId, inputAmount });
                return new errors_1.CouldNotFindLightningPaymentFlowError();
            }
            return paymentFlow;
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const updateLightningPaymentFlow = async (paymentFlow) => {
        try {
            const rawPaymentFlowState = rawFromPaymentFlow(paymentFlow);
            if (rawPaymentFlowState instanceof Error)
                return rawPaymentFlowState;
            const result = await schema_1.PaymentFlowState.findOneAndUpdate({
                senderWalletId: paymentFlow.senderWalletId,
                paymentHash: paymentFlow.paymentHash,
                inputAmount: Number(paymentFlow.inputAmount),
            }, rawPaymentFlowState, {
                new: true,
            });
            if (!result) {
                return new errors_1.CouldNotUpdateLightningPaymentFlowError();
            }
            return true;
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const markLightningPaymentFlowNotPending = async (paymentFlowIndex) => {
        const rawPaymentFlowIndex = rawIndexFromPaymentFlowIndex(paymentFlowIndex);
        if (rawPaymentFlowIndex instanceof Error)
            return rawPaymentFlowIndex;
        try {
            const result = await schema_1.PaymentFlowState.findOneAndUpdate(rawPaymentFlowIndex, { paymentSentAndPending: false }, {
                new: true,
            });
            if (!result) {
                return new errors_1.CouldNotUpdateLightningPaymentFlowError();
            }
            return paymentFlowFromRaw(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const deleteLightningPaymentFlow = async ({ walletId, paymentHash, intraLedgerHash, inputAmount, }) => {
        const hash = paymentHash ? { paymentHash } : { intraLedgerHash };
        try {
            const result = await schema_1.PaymentFlowState.deleteOne({
                ...hash,
                senderWalletId: walletId,
                inputAmount: Number(inputAmount),
            });
            if (result.deletedCount === 0) {
                return new errors_1.CouldNotFindLightningPaymentFlowError(paymentHash);
            }
            return true;
        }
        catch (error) {
            return new errors_1.UnknownRepositoryError(error);
        }
    };
    const deleteExpiredLightningPaymentFlows = async () => {
        const EXPIRY_TIME_IN_MS = expiryTimeInSeconds * 1000;
        const timestampExpired = new Date(Date.now() - EXPIRY_TIME_IN_MS);
        try {
            const result = await schema_1.PaymentFlowState.deleteMany({
                createdAt: { $lte: timestampExpired },
                paymentSentAndPending: false,
            });
            if (result.deletedCount === 0) {
                return new errors_1.NoExpiredLightningPaymentFlowsError();
            }
            return result.deletedCount;
        }
        catch (error) {
            return new errors_1.UnknownRepositoryError(error);
        }
    };
    return {
        findLightningPaymentFlow,
        persistNew,
        updateLightningPaymentFlow,
        markLightningPaymentFlowNotPending,
        deleteExpiredLightningPaymentFlows,
    };
};
exports.PaymentFlowStateRepository = PaymentFlowStateRepository;
const paymentFlowFromRaw = (paymentFlowState) => {
    const inputAmount = (0, safe_1.safeBigInt)(paymentFlowState.inputAmount);
    if (inputAmount instanceof Error)
        return inputAmount;
    const { paymentHash, intraLedgerHash } = paymentFlowState;
    const hash = paymentHash
        ? { paymentHash: paymentHash }
        : intraLedgerHash
            ? { intraLedgerHash: intraLedgerHash }
            : new payments_1.InvalidLightningPaymentFlowStateError("Missing valid 'paymentHash' or 'intraLedgerHash'");
    if (hash instanceof Error)
        return hash;
    const btcPaymentAmount = (0, shared_1.paymentAmountFromNumber)({
        amount: paymentFlowState.btcPaymentAmount,
        currency: shared_1.WalletCurrency.Btc,
    });
    if (btcPaymentAmount instanceof Error)
        return btcPaymentAmount;
    const usdPaymentAmount = (0, shared_1.paymentAmountFromNumber)({
        amount: paymentFlowState.usdPaymentAmount,
        currency: shared_1.WalletCurrency.Usd,
    });
    if (usdPaymentAmount instanceof Error)
        return usdPaymentAmount;
    const btcProtocolFee = (0, shared_1.paymentAmountFromNumber)({
        amount: paymentFlowState.btcProtocolFee,
        currency: shared_1.WalletCurrency.Btc,
    });
    if (btcProtocolFee instanceof Error)
        return btcProtocolFee;
    const usdProtocolFee = (0, shared_1.paymentAmountFromNumber)({
        amount: paymentFlowState.usdProtocolFee,
        currency: shared_1.WalletCurrency.Usd,
    });
    if (usdProtocolFee instanceof Error)
        return usdProtocolFee;
    return (0, payments_1.PaymentFlow)({
        ...hash,
        senderWalletId: paymentFlowState.senderWalletId,
        senderWalletCurrency: paymentFlowState.senderWalletCurrency,
        senderAccountId: paymentFlowState.senderAccountId,
        settlementMethod: paymentFlowState.settlementMethod,
        paymentInitiationMethod: paymentFlowState.paymentInitiationMethod,
        descriptionFromInvoice: paymentFlowState.descriptionFromInvoice,
        skipProbeForDestination: paymentFlowState.skipProbeForDestination,
        createdAt: paymentFlowState.createdAt,
        paymentSentAndPending: paymentFlowState.paymentSentAndPending,
        btcPaymentAmount,
        usdPaymentAmount,
        inputAmount,
        btcProtocolFee,
        usdProtocolFee,
        recipientWalletId: paymentFlowState.recipientWalletId || undefined,
        recipientWalletCurrency: paymentFlowState.recipientWalletCurrency || undefined,
        recipientAccountId: paymentFlowState.recipientAccountId || undefined,
        recipientPubkey: paymentFlowState.recipientPubkey || undefined,
        recipientUsername: paymentFlowState.recipientUsername || undefined,
        outgoingNodePubkey: paymentFlowState.outgoingNodePubkey || undefined,
        cachedRoute: paymentFlowState.cachedRoute,
    });
};
const rawFromPaymentFlow = (paymentFlow) => {
    const { paymentHash, intraLedgerHash } = paymentFlow;
    const hash = paymentHash
        ? { paymentHash }
        : intraLedgerHash
            ? { intraLedgerHash }
            : new payments_1.InvalidLightningPaymentFlowStateError("Missing valid 'paymentHash' or 'intraLedgerHash'");
    if (hash instanceof Error)
        return hash;
    return {
        ...hash,
        senderWalletId: paymentFlow.senderWalletId,
        senderWalletCurrency: paymentFlow.senderWalletCurrency,
        senderAccountId: paymentFlow.senderAccountId,
        settlementMethod: paymentFlow.settlementMethod,
        paymentInitiationMethod: paymentFlow.paymentInitiationMethod,
        descriptionFromInvoice: paymentFlow.descriptionFromInvoice,
        skipProbeForDestination: paymentFlow.skipProbeForDestination,
        createdAt: paymentFlow.createdAt,
        paymentSentAndPending: paymentFlow.paymentSentAndPending,
        btcPaymentAmount: Number(paymentFlow.btcPaymentAmount.amount),
        usdPaymentAmount: Number(paymentFlow.usdPaymentAmount.amount),
        inputAmount: Number(paymentFlow.inputAmount),
        btcProtocolFee: Number(paymentFlow.btcProtocolFee.amount),
        usdProtocolFee: Number(paymentFlow.usdProtocolFee.amount),
        recipientWalletId: paymentFlow.recipientWalletId,
        recipientWalletCurrency: paymentFlow.recipientWalletCurrency,
        recipientAccountId: paymentFlow.recipientAccountId,
        recipientPubkey: paymentFlow.recipientPubkey,
        recipientUsername: paymentFlow.recipientUsername,
        outgoingNodePubkey: paymentFlow.outgoingNodePubkey,
        cachedRoute: paymentFlow.cachedRoute,
    };
};
const rawIndexFromPaymentFlowIndex = (paymentFlowIndex) => {
    const { paymentHash, intraLedgerHash } = paymentFlowIndex;
    const hash = paymentHash
        ? { paymentHash }
        : intraLedgerHash
            ? { intraLedgerHash }
            : new payments_1.InvalidLightningPaymentFlowStateError("Missing valid 'paymentHash' or 'intraLedgerHash'");
    if (hash instanceof Error)
        return hash;
    return {
        ...hash,
        senderWalletId: paymentFlowIndex.walletId,
        inputAmount: Number(paymentFlowIndex.inputAmount),
    };
};
const isExpired = ({ paymentFlow, expiryTimeInSeconds, }) => {
    if (paymentFlow.paymentSentAndPending)
        return false;
    return (0, _utils_1.elapsedSinceTimestamp)(paymentFlow.createdAt) > expiryTimeInSeconds;
};
//# sourceMappingURL=payment-flow.js.map