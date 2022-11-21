"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentFlowFromLedgerTransaction = void 0;
const ledger_1 = require("../../domain/ledger");
const payments_1 = require("../../domain/payments");
const shared_1 = require("../../domain/shared");
const wallets_1 = require("../../domain/wallets");
const PaymentFlowFromLedgerTransaction = ({ ledgerTxn, senderAccountId, }) => {
    if (ledgerTxn.type !== ledger_1.LedgerTransactionType.Payment) {
        return new payments_1.NonLnPaymentTransactionForPaymentFlowError();
    }
    const settlementMethod = wallets_1.SettlementMethod.Lightning;
    const paymentInitiationMethod = wallets_1.PaymentInitiationMethod.Lightning;
    const { walletId: senderWalletId, currency: senderWalletCurrency, paymentHash, satsAmount, centsAmount, satsFee, centsFee, timestamp: createdAt, } = ledgerTxn;
    if (senderWalletId === undefined ||
        senderWalletCurrency === undefined ||
        paymentHash === undefined ||
        satsAmount === undefined ||
        centsAmount === undefined ||
        satsFee === undefined ||
        centsFee === undefined ||
        createdAt === undefined) {
        return new payments_1.MissingPropsInTransactionForPaymentFlowError();
    }
    const btcPaymentAmount = (0, shared_1.paymentAmountFromNumber)({
        amount: satsAmount,
        currency: shared_1.WalletCurrency.Btc,
    });
    if (btcPaymentAmount instanceof Error)
        return btcPaymentAmount;
    const usdPaymentAmount = (0, shared_1.paymentAmountFromNumber)({
        amount: centsAmount,
        currency: shared_1.WalletCurrency.Usd,
    });
    if (usdPaymentAmount instanceof Error)
        return usdPaymentAmount;
    const btcProtocolFee = (0, shared_1.paymentAmountFromNumber)({
        amount: satsFee,
        currency: shared_1.WalletCurrency.Btc,
    });
    if (btcProtocolFee instanceof Error)
        return btcProtocolFee;
    const usdProtocolFee = (0, shared_1.paymentAmountFromNumber)({
        amount: centsFee,
        currency: shared_1.WalletCurrency.Usd,
    });
    if (usdProtocolFee instanceof Error)
        return usdProtocolFee;
    return (0, payments_1.PaymentFlow)({
        senderWalletId,
        senderWalletCurrency,
        senderAccountId,
        settlementMethod,
        paymentInitiationMethod,
        paymentHash,
        descriptionFromInvoice: "",
        skipProbeForDestination: false,
        createdAt,
        paymentSentAndPending: true,
        btcPaymentAmount,
        usdPaymentAmount,
        inputAmount: senderWalletCurrency === shared_1.WalletCurrency.Usd
            ? usdPaymentAmount.amount
            : btcPaymentAmount.amount,
        btcProtocolFee,
        usdProtocolFee,
    });
};
exports.PaymentFlowFromLedgerTransaction = PaymentFlowFromLedgerTransaction;
//# sourceMappingURL=translations.js.map