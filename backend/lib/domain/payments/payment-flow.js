"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentFlow = void 0;
const errors_1 = require("../errors");
const shared_1 = require("../shared");
const tracing_1 = require("../../services/tracing");
const errors_2 = require("./errors");
const route_validator_1 = require("./route-validator");
const PaymentFlow = (state) => {
    const protocolFeeInSenderWalletCurrency = () => {
        return state.senderWalletCurrency === shared_1.WalletCurrency.Btc
            ? state.btcProtocolFee
            : state.usdProtocolFee;
    };
    const paymentAmounts = () => ({
        btc: state.btcPaymentAmount,
        usd: state.usdPaymentAmount,
    });
    const totalAmountsForPayment = () => ({
        btc: (0, shared_1.AmountCalculator)().add(state.btcPaymentAmount, state.btcProtocolFee),
        usd: (0, shared_1.AmountCalculator)().add(state.usdPaymentAmount, state.usdProtocolFee),
    });
    const routeDetails = () => {
        const uncheckedRawRoute = state.cachedRoute;
        let rawRoute = uncheckedRawRoute;
        if (uncheckedRawRoute) {
            const validateRoute = (0, route_validator_1.RouteValidator)(uncheckedRawRoute).validate(state.btcPaymentAmount);
            if (validateRoute instanceof Error) {
                rawRoute = undefined;
                (0, tracing_1.recordExceptionInCurrentSpan)({ error: validateRoute, level: shared_1.ErrorLevel.Warn });
            }
        }
        return {
            rawRoute,
            outgoingNodePubkey: rawRoute ? state.outgoingNodePubkey : undefined,
        };
    };
    const recipientDetails = () => ({
        recipientWalletId: state.recipientWalletId,
        recipientWalletCurrency: state.recipientWalletCurrency,
        recipientPubkey: state.recipientPubkey,
        recipientUsername: state.recipientUsername,
    });
    const senderWalletDescriptor = () => ({
        id: state.senderWalletId,
        currency: state.senderWalletCurrency,
        accountId: state.senderAccountId,
    });
    const recipientWalletDescriptor = () => state.recipientWalletId && state.recipientWalletCurrency && state.recipientAccountId
        ? {
            id: state.recipientWalletId,
            currency: state.recipientWalletCurrency,
            accountId: state.recipientAccountId,
        }
        : undefined;
    const checkBalanceForSend = (balanceAmount) => {
        if (state.senderWalletCurrency !== balanceAmount.currency)
            return new errors_1.InvalidCurrencyForWalletError();
        const { amount, fee } = balanceAmount.currency === shared_1.WalletCurrency.Btc
            ? { amount: state.btcPaymentAmount, fee: state.btcProtocolFee }
            : { amount: state.usdPaymentAmount, fee: state.usdProtocolFee };
        const totalSendAmount = (0, shared_1.AmountCalculator)().add(amount, fee);
        if (balanceAmount.amount < totalSendAmount.amount) {
            const unitForMsg = state.senderWalletCurrency === shared_1.WalletCurrency.Btc ? "sats" : "cents";
            return new errors_1.InsufficientBalanceError(`Payment amount '${totalSendAmount.amount}' ${unitForMsg} exceeds balance '${balanceAmount.amount}'`);
        }
        return true;
    };
    const paymentHashForFlow = () => {
        const { paymentHash, intraLedgerHash } = state;
        if (!!paymentHash === !!intraLedgerHash) {
            return new errors_2.InvalidLightningPaymentFlowBuilderStateError();
        }
        if (!paymentHash) {
            return new errors_2.IntraLedgerHashPresentInLnFlowError();
        }
        return paymentHash;
    };
    const intraLedgerHashForFlow = () => {
        const { paymentHash, intraLedgerHash } = state;
        if (!!paymentHash === !!intraLedgerHash) {
            return new errors_2.InvalidLightningPaymentFlowBuilderStateError();
        }
        if (!intraLedgerHash) {
            return new errors_2.LnHashPresentInIntraLedgerFlowError();
        }
        return intraLedgerHash;
    };
    return {
        ...state,
        protocolFeeInSenderWalletCurrency,
        paymentAmounts,
        totalAmountsForPayment,
        routeDetails,
        recipientDetails,
        senderWalletDescriptor,
        recipientWalletDescriptor,
        checkBalanceForSend,
        paymentHashForFlow,
        intraLedgerHashForFlow,
    };
};
exports.PaymentFlow = PaymentFlow;
//# sourceMappingURL=payment-flow.js.map