"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMetadataByHash = exports.recordLnSendRevert = exports.settlePendingLnSend = exports.recordIntraledger = exports.getLedgerAccountBalanceForWalletId = exports.recordReceive = exports.recordSend = void 0;
const shared_1 = require("../../domain/shared");
const books_1 = require("./books");
const domain_1 = require("./domain");
const helpers_1 = require("./helpers");
const caching = __importStar(require("./caching"));
const services_1 = require("./services");
const errors_1 = require("./domain/errors");
const _1 = require(".");
__exportStar(require("./tx-metadata"), exports);
const calc = (0, shared_1.AmountCalculator)();
const txMetadataRepo = (0, services_1.TransactionsMetadataRepository)();
const staticAccountIds = async () => {
    return {
        bankOwnerAccountId: (0, domain_1.toLedgerAccountId)(await caching.getBankOwnerWalletId()),
        dealerBtcAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerBtcWalletId()),
        dealerUsdAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerUsdWalletId()),
    };
};
const recordSend = async ({ description, senderWalletDescriptor, amountToDebitSender, bankFee, metadata, }) => {
    const actualFee = bankFee || { usd: shared_1.ZERO_CENTS, btc: shared_1.ZERO_SATS };
    let entry = books_1.MainBook.entry(description);
    const builder = (0, domain_1.EntryBuilder)({
        staticAccountIds: await staticAccountIds(),
        entry,
        metadata,
    });
    entry = builder
        .withTotalAmount({
        usdWithFees: amountToDebitSender.usd,
        btcWithFees: amountToDebitSender.btc,
    })
        .withBankFee({ usdBankFee: actualFee.usd, btcBankFee: actualFee.btc })
        .debitAccount({
        accountDescriptor: (0, domain_1.toLedgerAccountDescriptor)(senderWalletDescriptor),
    })
        .creditLnd();
    return (0, helpers_1.persistAndReturnEntry)({ entry, hash: metadata.hash });
};
exports.recordSend = recordSend;
const recordReceive = async ({ description, recipientWalletDescriptor, amountToCreditReceiver, bankFee, metadata, txMetadata, }) => {
    const actualFee = bankFee || { usd: shared_1.ZERO_CENTS, btc: shared_1.ZERO_SATS };
    let entry = books_1.MainBook.entry(description);
    const builder = (0, domain_1.EntryBuilder)({
        staticAccountIds: await staticAccountIds(),
        entry,
        metadata,
    });
    const amountWithFees = {
        usdWithFees: calc.add(amountToCreditReceiver.usd, actualFee.usd),
        btcWithFees: calc.add(amountToCreditReceiver.btc, actualFee.btc),
    };
    entry = builder
        .withTotalAmount(amountWithFees)
        .withBankFee({ usdBankFee: actualFee.usd, btcBankFee: actualFee.btc })
        .debitLnd()
        .creditAccount((0, domain_1.toLedgerAccountDescriptor)(recipientWalletDescriptor));
    return (0, helpers_1.persistAndReturnEntry)({ entry, ...txMetadata });
};
exports.recordReceive = recordReceive;
const getLedgerAccountBalanceForWalletId = async ({ id: walletId, currency, }) => {
    try {
        const { balance } = await books_1.MainBook.balance({
            account: (0, domain_1.toLedgerAccountId)(walletId),
        });
        return (0, shared_1.paymentAmountFromNumber)({ amount: balance, currency });
    }
    catch (err) {
        return new errors_1.UnknownLedgerError(err);
    }
};
exports.getLedgerAccountBalanceForWalletId = getLedgerAccountBalanceForWalletId;
const recordIntraledger = async ({ description, senderWalletDescriptor, recipientWalletDescriptor, amount, metadata, additionalDebitMetadata: additionalMetadata, }) => {
    let entry = books_1.MainBook.entry(description);
    const builder = (0, domain_1.EntryBuilder)({
        staticAccountIds: await staticAccountIds(),
        entry,
        metadata,
    });
    entry = builder
        .withTotalAmount({ usdWithFees: amount.usd, btcWithFees: amount.btc })
        .withBankFee(shared_1.ZERO_BANK_FEE)
        .debitAccount({
        accountDescriptor: (0, domain_1.toLedgerAccountDescriptor)(senderWalletDescriptor),
        additionalMetadata,
    })
        .creditAccount((0, domain_1.toLedgerAccountDescriptor)(recipientWalletDescriptor));
    return (0, helpers_1.persistAndReturnEntry)({
        entry,
        hash: "hash" in metadata ? metadata.hash : undefined,
    });
};
exports.recordIntraledger = recordIntraledger;
const settlePendingLnSend = async (paymentHash) => {
    try {
        const result = await books_1.Transaction.updateMany({ hash: paymentHash }, { pending: false });
        const success = result.modifiedCount > 0;
        if (!success) {
            return new errors_1.NoTransactionToSettleError();
        }
        return true;
    }
    catch (err) {
        return new errors_1.UnknownLedgerError(err);
    }
};
exports.settlePendingLnSend = settlePendingLnSend;
const recordLnSendRevert = async ({ journalId, paymentHash, }) => {
    const reason = "Payment canceled";
    try {
        const savedEntry = await books_1.MainBook.void(journalId, reason);
        const journalEntry = (0, _1.translateToLedgerJournal)(savedEntry);
        const txsMetadataToPersist = journalEntry.transactionIds.map((id) => ({
            id,
            hash: paymentHash,
        }));
        txMetadataRepo.persistAll(txsMetadataToPersist);
        return true;
    }
    catch (err) {
        return new errors_1.UnknownLedgerError(err);
    }
};
exports.recordLnSendRevert = recordLnSendRevert;
const updateMetadataByHash = async (ledgerTxMetadata) => (0, services_1.TransactionsMetadataRepository)().updateByHash(ledgerTxMetadata);
exports.updateMetadataByHash = updateMetadataByHash;
//# sourceMappingURL=facade.js.map