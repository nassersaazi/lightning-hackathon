"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.volume = exports.TxnGroups = void 0;
const ledger_1 = require("../../domain/ledger");
const errors_1 = require("../../domain/ledger/errors");
const shared_1 = require("../../domain/shared");
const tracing_1 = require("../tracing");
const books_1 = require("./books");
exports.TxnGroups = {
    allPaymentVolumeSince: [
        ledger_1.LedgerTransactionType.IntraLedger,
        ledger_1.LedgerTransactionType.OnchainIntraLedger,
        ledger_1.LedgerTransactionType.LnIntraLedger,
        ledger_1.LedgerTransactionType.Payment,
        ledger_1.LedgerTransactionType.OnchainPayment,
    ],
    externalPaymentVolumeSince: [
        ledger_1.LedgerTransactionType.Payment,
        ledger_1.LedgerTransactionType.OnchainPayment,
    ],
    intraledgerTxBaseVolumeSince: [
        ledger_1.LedgerTransactionType.IntraLedger,
        ledger_1.LedgerTransactionType.OnchainIntraLedger,
        ledger_1.LedgerTransactionType.LnIntraLedger,
    ],
    tradeIntraAccountTxBaseVolumeSince: [
        ledger_1.LedgerTransactionType.WalletIdTradeIntraAccount,
        ledger_1.LedgerTransactionType.OnChainTradeIntraAccount,
        ledger_1.LedgerTransactionType.LnTradeIntraAccount,
    ],
    lightningTxBaseVolumeSince: [
        ledger_1.LedgerTransactionType.Payment,
        ledger_1.LedgerTransactionType.Invoice,
        ledger_1.LedgerTransactionType.LnFeeReimbursement,
    ],
    onChainTxBaseVolumeSince: [
        ledger_1.LedgerTransactionType.OnchainPayment,
        ledger_1.LedgerTransactionType.OnchainReceipt,
    ],
    allTxBaseVolumeSince: Object.values(ledger_1.LedgerTransactionType),
};
const volumeFn = (txnGroup) => async (args) => txVolumeSince({ ...args, txnGroup });
const volumeAmountFn = (txnGroup) => async (args) => {
    const { walletDescriptor: { id: walletId, currency: walletCurrency }, timestamp, } = args;
    const volume = await txVolumeSince({ walletId, timestamp, txnGroup });
    if (volume instanceof Error)
        return volume;
    const outgoingBaseAmount = (0, shared_1.paymentAmountFromNumber)({
        amount: volume.outgoingBaseAmount,
        currency: walletCurrency,
    });
    if (outgoingBaseAmount instanceof Error)
        return outgoingBaseAmount;
    const incomingBaseAmount = (0, shared_1.paymentAmountFromNumber)({
        amount: volume.incomingBaseAmount,
        currency: walletCurrency,
    });
    if (incomingBaseAmount instanceof Error)
        return incomingBaseAmount;
    return { outgoingBaseAmount, incomingBaseAmount };
};
const txVolumeSince = async ({ walletId, timestamp, txnGroup, }) => {
    const liabilitiesWalletId = (0, ledger_1.toLiabilitiesWalletId)(walletId);
    const txnTypes = exports.TxnGroups[txnGroup];
    const txnTypesObj = txnTypes.map((txnType) => ({
        type: txnType,
    }));
    try {
        const [result] = await books_1.Transaction.aggregate([
            {
                $match: {
                    accounts: liabilitiesWalletId,
                    $or: txnTypesObj,
                    $and: [{ timestamp: { $gte: timestamp } }],
                },
            },
            {
                $group: {
                    _id: null,
                    outgoingBaseAmount: { $sum: "$debit" },
                    incomingBaseAmount: { $sum: "$credit" },
                },
            },
        ]);
        const outgoingBaseAmount = result?.outgoingBaseAmount ?? 0;
        const incomingBaseAmount = result?.incomingBaseAmount ?? 0;
        (0, tracing_1.addAttributesToCurrentSpan)({
            "txVolume.function": txnGroup,
            "txVolume.outgoing": outgoingBaseAmount.toString(),
            "txVolume.incoming": incomingBaseAmount.toString(),
        });
        return { outgoingBaseAmount, incomingBaseAmount };
    }
    catch (err) {
        return new errors_1.UnknownLedgerError(err);
    }
};
exports.volume = {
    allPaymentVolumeSince: volumeFn("allPaymentVolumeSince"),
    externalPaymentVolumeSince: volumeFn("externalPaymentVolumeSince"),
    intraledgerTxBaseVolumeSince: volumeFn("intraledgerTxBaseVolumeSince"),
    tradeIntraAccountTxBaseVolumeSince: volumeFn("tradeIntraAccountTxBaseVolumeSince"),
    allTxBaseVolumeSince: volumeFn("allTxBaseVolumeSince"),
    onChainTxBaseVolumeSince: volumeFn("onChainTxBaseVolumeSince"),
    lightningTxBaseVolumeSince: volumeFn("lightningTxBaseVolumeSince"),
    allPaymentVolumeAmountSince: volumeAmountFn("allPaymentVolumeSince"),
    externalPaymentVolumeAmountSince: volumeAmountFn("externalPaymentVolumeSince"),
    intraledgerTxBaseVolumeAmountSince: volumeAmountFn("intraledgerTxBaseVolumeSince"),
    tradeIntraAccountTxBaseVolumeAmountSince: volumeAmountFn("tradeIntraAccountTxBaseVolumeSince"),
    allTxBaseVolumeAmountSince: volumeAmountFn("allTxBaseVolumeSince"),
    onChainTxBaseVolumeAmountSince: volumeAmountFn("onChainTxBaseVolumeSince"),
    lightningTxBaseVolumeAmountSince: volumeAmountFn("lightningTxBaseVolumeSince"),
};
//# sourceMappingURL=volume.js.map