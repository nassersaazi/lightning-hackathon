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
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = void 0;
const ledger_1 = require("../../domain/ledger");
const errors_1 = require("../../domain/errors");
const errors_2 = require("../../domain/ledger/errors");
const shared_1 = require("../../domain/shared");
const utils_1 = require("../mongoose/utils");
const domain_1 = require("./domain");
const books_1 = require("./books");
const caching = __importStar(require("./caching"));
const services_1 = require("./services");
const _1 = require(".");
const txMetadataRepo = (0, services_1.TransactionsMetadataRepository)();
exports.send = {
    addOnChainTxSend: async ({ walletId, walletCurrency, txHash, payeeAddress, description, sats, bankFee, amountDisplayCurrency, totalFee, totalFeeDisplayCurrency, sendAll, }) => {
        const metadata = {
            type: ledger_1.LedgerTransactionType.OnchainPayment,
            pending: true,
            hash: txHash,
            payee_addresses: [payeeAddress],
            fee: totalFee,
            feeUsd: totalFeeDisplayCurrency,
            usd: amountDisplayCurrency,
            sendAll,
        };
        if (bankFee > 0) {
            return addSendInternalFee({
                walletId,
                walletCurrency,
                metadata,
                description,
                sats,
                fee: bankFee,
            });
        }
        return addSendNoInternalFee({
            walletId,
            walletCurrency,
            metadata,
            description,
            sats,
        });
    },
    setOnChainTxSendHash: async ({ journalId, newTxHash, }) => {
        try {
            const result = await books_1.Transaction.updateMany({ _journal: (0, utils_1.toObjectId)(journalId) }, { hash: newTxHash });
            const success = result.modifiedCount > 0;
            if (!success) {
                return new errors_1.NoTransactionToUpdateError();
            }
            return true;
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    },
    settlePendingLnPayment: async (paymentHash) => {
        try {
            const result = await books_1.Transaction.updateMany({ hash: paymentHash }, { pending: false });
            const success = result.modifiedCount > 0;
            if (!success) {
                return new errors_2.NoTransactionToSettleError();
            }
            return true;
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    },
    settlePendingOnChainPayment: async (hash) => {
        try {
            const result = await books_1.Transaction.updateMany({ hash }, { pending: false });
            const success = result.modifiedCount > 0;
            if (!success) {
                return new errors_2.NoTransactionToSettleError();
            }
            return true;
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    },
    revertLightningPayment: async ({ journalId, paymentHash, }) => {
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
            return new errors_2.UnknownLedgerError(err);
        }
    },
    revertOnChainPayment: async ({ journalId, description = "Protocol error", }) => {
        try {
            // pending update must be before void to avoid pending voided records
            await books_1.Transaction.updateMany({ _journal: (0, utils_1.toObjectId)(journalId) }, { pending: false });
            await books_1.MainBook.void(journalId, description);
            // TODO: persist to metadata
            return true;
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    },
};
const addSendNoInternalFee = async ({ metadata: metaInput, walletId, walletCurrency, sats, cents, description, }) => {
    const accountId = (0, domain_1.toLedgerAccountId)(walletId);
    const staticAccountIds = {
        bankOwnerAccountId: (0, domain_1.toLedgerAccountId)(await caching.getBankOwnerWalletId()),
        dealerBtcAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerBtcWalletId()),
        dealerUsdAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerUsdWalletId()),
    };
    const metadata = { ...metaInput, currency: walletCurrency };
    let entry = books_1.MainBook.entry(description);
    const builder = (0, domain_1.LegacyEntryBuilder)({
        staticAccountIds,
        entry,
        metadata,
    }).withoutFee();
    const satsAmount = (0, shared_1.paymentAmountFromNumber)({
        amount: sats,
        currency: shared_1.WalletCurrency.Btc,
    });
    if (satsAmount instanceof Error)
        return satsAmount;
    if (walletCurrency === shared_1.WalletCurrency.Btc) {
        entry = builder
            .debitAccount({
            accountId,
            amount: satsAmount,
        })
            .creditLnd();
    }
    if (walletCurrency === shared_1.WalletCurrency.Usd) {
        if (!cents)
            return new errors_2.UnknownLedgerError("Cents are required");
        const centsAmount = (0, shared_1.paymentAmountFromNumber)({
            amount: cents,
            currency: shared_1.WalletCurrency.Usd,
        });
        if (centsAmount instanceof Error)
            return centsAmount;
        entry = builder
            .debitAccount({
            accountId,
            amount: centsAmount,
        })
            .creditLnd(satsAmount);
    }
    try {
        const savedEntry = await entry.commit();
        const journalEntry = (0, _1.translateToLedgerJournal)(savedEntry);
        const txsMetadataToPersist = journalEntry.transactionIds.map((id) => ({
            id,
            hash: metadata.hash,
        }));
        txMetadataRepo.persistAll(txsMetadataToPersist);
        return journalEntry;
    }
    catch (err) {
        return new errors_2.UnknownLedgerError(err);
    }
};
const addSendInternalFee = async ({ metadata: metaInput, walletId, walletCurrency, sats, fee, description, }) => {
    // TODO: remove once implemented
    if (walletCurrency !== shared_1.WalletCurrency.Btc) {
        return new errors_1.NotImplementedError("USD Intraledger");
    }
    const accountId = (0, domain_1.toLedgerAccountId)(walletId);
    const staticAccountIds = {
        bankOwnerAccountId: (0, domain_1.toLedgerAccountId)(await caching.getBankOwnerWalletId()),
        dealerBtcAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerBtcWalletId()),
        dealerUsdAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerUsdWalletId()),
    };
    try {
        const feeSatsAmount = (0, shared_1.paymentAmountFromNumber)({
            amount: fee,
            currency: shared_1.WalletCurrency.Btc,
        });
        if (feeSatsAmount instanceof Error)
            return feeSatsAmount;
        const satsAmount = (0, shared_1.paymentAmountFromNumber)({
            amount: sats,
            currency: shared_1.WalletCurrency.Btc,
        });
        if (satsAmount instanceof Error)
            return satsAmount;
        const entry = books_1.MainBook.entry(description);
        const builder = (0, domain_1.LegacyEntryBuilder)({
            staticAccountIds,
            entry,
            metadata: metaInput,
        })
            .withFee(feeSatsAmount)
            .debitAccount({ accountId, amount: satsAmount })
            .creditLnd();
        const savedEntry = await builder.commit();
        const journalEntry = (0, _1.translateToLedgerJournal)(savedEntry);
        const txsMetadataToPersist = journalEntry.transactionIds.map((id) => ({
            id,
            hash: metaInput.hash,
        }));
        txMetadataRepo.persistAll(txsMetadataToPersist);
        return journalEntry;
    }
    catch (err) {
        return new errors_2.UnknownLedgerError(err);
    }
};
//# sourceMappingURL=send.js.map