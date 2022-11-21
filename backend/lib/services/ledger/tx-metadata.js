"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LnRoutingRevenue = exports.Escrow = exports.LnChannelOpenOrClosingFee = exports.LnTradeIntraAccountLedgerMetadata = exports.WalletIdTradeIntraAccountLedgerMetadata = exports.OnChainTradeIntraAccountLedgerMetadata = exports.LnIntraledgerLedgerMetadata = exports.WalletIdIntraledgerLedgerMetadata = exports.OnChainIntraledgerLedgerMetadata = exports.LnFeeReimbursementReceiveLedgerMetadata = exports.LnReceiveLedgerMetadata = exports.OnChainReceiveLedgerMetadata = exports.OnChainSendLedgerMetadata = exports.LnSendLedgerMetadata = void 0;
const bitcoin_1 = require("../../domain/bitcoin");
const fiat_1 = require("../../domain/fiat");
const ledger_1 = require("../../domain/ledger");
const LnSendLedgerMetadata = ({ paymentHash, pubkey, paymentFlow, feeDisplayCurrency, amountDisplayCurrency, displayCurrency, feeKnownInAdvance, }) => {
    const { btcPaymentAmount: { amount: satsAmount }, usdPaymentAmount: { amount: centsAmount }, btcProtocolFee: { amount: satsFee }, usdProtocolFee: { amount: centsFee }, } = paymentFlow;
    const metadata = {
        type: ledger_1.LedgerTransactionType.Payment,
        pending: true,
        hash: paymentHash,
        pubkey,
        feeKnownInAdvance,
        fee: (0, bitcoin_1.toSats)(satsFee),
        feeUsd: (feeDisplayCurrency / 100),
        usd: ((amountDisplayCurrency + feeDisplayCurrency) /
            100),
        satsFee: (0, bitcoin_1.toSats)(satsFee),
        displayFee: feeDisplayCurrency,
        displayAmount: amountDisplayCurrency,
        displayCurrency,
        centsAmount: (0, fiat_1.toCents)(centsAmount),
        satsAmount: (0, bitcoin_1.toSats)(satsAmount),
        centsFee: (0, fiat_1.toCents)(centsFee),
    };
    return metadata;
};
exports.LnSendLedgerMetadata = LnSendLedgerMetadata;
const OnChainSendLedgerMetadata = ({ onChainTxHash, fee, feeDisplayCurrency, amountDisplayCurrency, payeeAddresses, sendAll, }) => {
    const metadata = {
        type: ledger_1.LedgerTransactionType.OnchainPayment,
        pending: true,
        hash: onChainTxHash,
        payee_addresses: payeeAddresses,
        fee: Number(fee.amount),
        feeUsd: feeDisplayCurrency,
        usd: amountDisplayCurrency,
        sendAll,
    };
    return metadata;
};
exports.OnChainSendLedgerMetadata = OnChainSendLedgerMetadata;
const OnChainReceiveLedgerMetadata = ({ onChainTxHash, fee, feeDisplayCurrency, amountDisplayCurrency, payeeAddresses, }) => {
    const metadata = {
        type: ledger_1.LedgerTransactionType.OnchainReceipt,
        pending: false,
        hash: onChainTxHash,
        fee: Number(fee.amount),
        feeUsd: feeDisplayCurrency,
        usd: amountDisplayCurrency,
        payee_addresses: payeeAddresses,
    };
    return metadata;
};
exports.OnChainReceiveLedgerMetadata = OnChainReceiveLedgerMetadata;
const LnReceiveLedgerMetadata = ({ paymentHash, fee, feeDisplayCurrency, amountDisplayCurrency, }) => {
    const convertCentsToUsdAsDollars = (cents) => Number((Number(cents) / 100).toFixed(2));
    const metadata = {
        type: ledger_1.LedgerTransactionType.Invoice,
        pending: false,
        hash: paymentHash,
        fee: Number(fee.amount),
        feeUsd: convertCentsToUsdAsDollars(feeDisplayCurrency),
        usd: convertCentsToUsdAsDollars(amountDisplayCurrency),
    };
    return metadata;
};
exports.LnReceiveLedgerMetadata = LnReceiveLedgerMetadata;
const LnFeeReimbursementReceiveLedgerMetadata = ({ paymentFlow, paymentHash, journalId, feeDisplayCurrency, amountDisplayCurrency, displayCurrency, }) => {
    const { btcPaymentAmount: { amount: satsAmount }, usdPaymentAmount: { amount: centsAmount }, btcProtocolFee: { amount: satsFee }, usdProtocolFee: { amount: centsFee }, } = paymentFlow;
    const metadata = {
        type: ledger_1.LedgerTransactionType.LnFeeReimbursement,
        hash: paymentHash,
        related_journal: journalId,
        pending: false,
        usd: ((amountDisplayCurrency + feeDisplayCurrency) /
            100),
        satsFee: (0, bitcoin_1.toSats)(satsFee),
        displayFee: feeDisplayCurrency,
        displayAmount: amountDisplayCurrency,
        displayCurrency,
        centsAmount: (0, fiat_1.toCents)(centsAmount),
        satsAmount: (0, bitcoin_1.toSats)(satsAmount),
        centsFee: (0, fiat_1.toCents)(centsFee),
    };
    return metadata;
};
exports.LnFeeReimbursementReceiveLedgerMetadata = LnFeeReimbursementReceiveLedgerMetadata;
const OnChainIntraledgerLedgerMetadata = ({ amountDisplayCurrency, payeeAddresses, sendAll, memoOfPayer, senderUsername, recipientUsername, }) => {
    const metadata = {
        type: ledger_1.LedgerTransactionType.OnchainIntraLedger,
        pending: false,
        usd: amountDisplayCurrency,
        memoPayer: undefined,
        username: senderUsername,
        payee_addresses: payeeAddresses,
        sendAll,
    };
    const debitAccountAdditionalMetadata = {
        memoPayer: memoOfPayer,
        username: recipientUsername,
    };
    return { metadata, debitAccountAdditionalMetadata };
};
exports.OnChainIntraledgerLedgerMetadata = OnChainIntraledgerLedgerMetadata;
const WalletIdIntraledgerLedgerMetadata = ({ paymentFlow, feeDisplayCurrency, amountDisplayCurrency, displayCurrency, memoOfPayer, senderUsername, recipientUsername, }) => {
    const { btcPaymentAmount: { amount: satsAmount }, usdPaymentAmount: { amount: centsAmount }, btcProtocolFee: { amount: satsFee }, usdProtocolFee: { amount: centsFee }, } = paymentFlow;
    const metadata = {
        type: ledger_1.LedgerTransactionType.IntraLedger,
        pending: false,
        memoPayer: memoOfPayer,
        username: senderUsername,
        usd: (amountDisplayCurrency / 100),
        satsFee: (0, bitcoin_1.toSats)(satsFee),
        displayFee: feeDisplayCurrency,
        displayAmount: amountDisplayCurrency,
        displayCurrency,
        centsAmount: (0, fiat_1.toCents)(centsAmount),
        satsAmount: (0, bitcoin_1.toSats)(satsAmount),
        centsFee: (0, fiat_1.toCents)(centsFee),
    };
    const debitAccountAdditionalMetadata = {
        username: recipientUsername,
    };
    return { metadata, debitAccountAdditionalMetadata };
};
exports.WalletIdIntraledgerLedgerMetadata = WalletIdIntraledgerLedgerMetadata;
const LnIntraledgerLedgerMetadata = ({ paymentHash, pubkey, paymentFlow, feeDisplayCurrency, amountDisplayCurrency, displayCurrency, memoOfPayer, senderUsername, recipientUsername, }) => {
    const { btcPaymentAmount: { amount: satsAmount }, usdPaymentAmount: { amount: centsAmount }, btcProtocolFee: { amount: satsFee }, usdProtocolFee: { amount: centsFee }, } = paymentFlow;
    const metadata = {
        type: ledger_1.LedgerTransactionType.LnIntraLedger,
        pending: false,
        memoPayer: undefined,
        username: senderUsername,
        hash: paymentHash,
        pubkey,
        usd: (amountDisplayCurrency / 100),
        satsFee: (0, bitcoin_1.toSats)(satsFee),
        displayFee: feeDisplayCurrency,
        displayAmount: amountDisplayCurrency,
        displayCurrency,
        centsAmount: (0, fiat_1.toCents)(centsAmount),
        satsAmount: (0, bitcoin_1.toSats)(satsAmount),
        centsFee: (0, fiat_1.toCents)(centsFee),
    };
    const debitAccountAdditionalMetadata = {
        memoPayer: memoOfPayer,
        username: recipientUsername,
    };
    return { metadata, debitAccountAdditionalMetadata };
};
exports.LnIntraledgerLedgerMetadata = LnIntraledgerLedgerMetadata;
const OnChainTradeIntraAccountLedgerMetadata = ({ amountDisplayCurrency, payeeAddresses, sendAll, memoOfPayer, }) => {
    const metadata = {
        type: ledger_1.LedgerTransactionType.OnChainTradeIntraAccount,
        pending: false,
        usd: amountDisplayCurrency,
        memoPayer: undefined,
        payee_addresses: payeeAddresses,
        sendAll,
    };
    const debitAccountAdditionalMetadata = {
        memoPayer: memoOfPayer,
    };
    return { metadata, debitAccountAdditionalMetadata };
};
exports.OnChainTradeIntraAccountLedgerMetadata = OnChainTradeIntraAccountLedgerMetadata;
const WalletIdTradeIntraAccountLedgerMetadata = ({ paymentFlow, feeDisplayCurrency, amountDisplayCurrency, displayCurrency, memoOfPayer, }) => {
    const { btcPaymentAmount: { amount: satsAmount }, usdPaymentAmount: { amount: centsAmount }, btcProtocolFee: { amount: satsFee }, usdProtocolFee: { amount: centsFee }, } = paymentFlow;
    const metadata = {
        type: ledger_1.LedgerTransactionType.WalletIdTradeIntraAccount,
        pending: false,
        memoPayer: memoOfPayer,
        usd: (amountDisplayCurrency / 100),
        satsFee: (0, bitcoin_1.toSats)(satsFee),
        displayFee: feeDisplayCurrency,
        displayAmount: amountDisplayCurrency,
        displayCurrency,
        centsAmount: (0, fiat_1.toCents)(centsAmount),
        satsAmount: (0, bitcoin_1.toSats)(satsAmount),
        centsFee: (0, fiat_1.toCents)(centsFee),
    };
    return metadata;
};
exports.WalletIdTradeIntraAccountLedgerMetadata = WalletIdTradeIntraAccountLedgerMetadata;
const LnTradeIntraAccountLedgerMetadata = ({ paymentHash, pubkey, paymentFlow, feeDisplayCurrency, amountDisplayCurrency, displayCurrency, memoOfPayer, }) => {
    const { btcPaymentAmount: { amount: satsAmount }, usdPaymentAmount: { amount: centsAmount }, btcProtocolFee: { amount: satsFee }, usdProtocolFee: { amount: centsFee }, } = paymentFlow;
    const metadata = {
        type: ledger_1.LedgerTransactionType.LnTradeIntraAccount,
        pending: false,
        memoPayer: undefined,
        hash: paymentHash,
        pubkey,
        usd: (amountDisplayCurrency / 100),
        satsFee: (0, bitcoin_1.toSats)(satsFee),
        displayFee: feeDisplayCurrency,
        displayAmount: amountDisplayCurrency,
        displayCurrency,
        centsAmount: (0, fiat_1.toCents)(centsAmount),
        satsAmount: (0, bitcoin_1.toSats)(satsAmount),
        centsFee: (0, fiat_1.toCents)(centsFee),
    };
    const debitAccountAdditionalMetadata = {
        memoPayer: memoOfPayer,
    };
    return { metadata, debitAccountAdditionalMetadata };
};
exports.LnTradeIntraAccountLedgerMetadata = LnTradeIntraAccountLedgerMetadata;
const LnChannelOpenOrClosingFee = ({ txId }) => {
    const metadata = {
        type: ledger_1.LedgerTransactionType.Fee,
        pending: false,
        txid: txId,
    };
    return metadata;
};
exports.LnChannelOpenOrClosingFee = LnChannelOpenOrClosingFee;
const Escrow = () => {
    const metadata = {
        type: ledger_1.LedgerTransactionType.Escrow,
        pending: false,
    };
    return metadata;
};
exports.Escrow = Escrow;
const LnRoutingRevenue = (collectedOn) => {
    const metadata = {
        type: ledger_1.LedgerTransactionType.RoutingRevenue,
        feesCollectedOn: collectedOn.toDateString(),
        pending: false,
    };
    return metadata;
};
exports.LnRoutingRevenue = LnRoutingRevenue;
//# sourceMappingURL=tx-metadata.js.map