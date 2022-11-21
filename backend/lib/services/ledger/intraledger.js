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
exports.intraledger = void 0;
const ledger_1 = require("../../domain/ledger");
const errors_1 = require("../../domain/ledger/errors");
const shared_1 = require("../../domain/shared");
const errors_2 = require("../../domain/errors");
const domain_1 = require("./domain");
const books_1 = require("./books");
const caching = __importStar(require("./caching"));
const services_1 = require("./services");
const _1 = require(".");
exports.intraledger = {
    addOnChainIntraledgerTxTransfer: async ({ senderWalletId, senderWalletCurrency, senderUsername, description, sats, amountDisplayCurrency, payeeAddresses, sendAll, recipientWalletId, recipientWalletCurrency, recipientUsername, memoPayer, }) => {
        const metadata = {
            type: ledger_1.LedgerTransactionType.OnchainIntraLedger,
            pending: false,
            usd: amountDisplayCurrency,
            memoPayer: undefined,
            username: undefined,
            payee_addresses: payeeAddresses,
            sendAll,
        };
        return addIntraledgerTxTransfer({
            senderWalletId,
            senderWalletCurrency,
            senderUsername,
            description,
            sats,
            recipientWalletId,
            recipientWalletCurrency,
            recipientUsername,
            memoPayer,
            shareMemoWithPayee: false,
            metadata,
        });
    },
    addWalletIdIntraledgerTxTransfer: async ({ senderWalletId, senderWalletCurrency, senderUsername, description, sats, amountDisplayCurrency, recipientWalletId, recipientWalletCurrency, recipientUsername, memoPayer, }) => {
        const metadata = {
            type: ledger_1.LedgerTransactionType.IntraLedger,
            pending: false,
            usd: amountDisplayCurrency,
            memoPayer: undefined,
            username: undefined,
        };
        return addIntraledgerTxTransfer({
            senderWalletId,
            senderWalletCurrency,
            senderUsername,
            description,
            sats,
            recipientWalletId,
            recipientWalletCurrency,
            recipientUsername,
            memoPayer,
            shareMemoWithPayee: true,
            metadata,
        });
    },
    addLnIntraledgerTxTransfer: async ({ senderWalletId, senderWalletCurrency, senderUsername, paymentHash, description, sats, cents, amountDisplayCurrency, pubkey, recipientWalletId, recipientWalletCurrency, recipientUsername, memoPayer, }) => {
        const metadata = {
            type: ledger_1.LedgerTransactionType.IntraLedger,
            pending: false,
            hash: paymentHash,
            usd: amountDisplayCurrency,
            pubkey,
            memoPayer: undefined,
            username: undefined,
        };
        return addIntraledgerTxTransfer({
            senderWalletId,
            senderWalletCurrency,
            senderUsername,
            description,
            sats,
            cents,
            recipientWalletId,
            recipientUsername,
            recipientWalletCurrency,
            memoPayer,
            shareMemoWithPayee: false,
            metadata,
            paymentHash,
        });
    },
};
const addIntraledgerTxTransfer = async ({ senderWalletId, senderWalletCurrency, senderUsername, description, sats, cents, recipientWalletId, recipientUsername, recipientWalletCurrency, memoPayer, shareMemoWithPayee, metadata, paymentHash, }) => {
    const senderAccountId = (0, domain_1.toLedgerAccountId)(senderWalletId);
    const recipientAccountId = (0, domain_1.toLedgerAccountId)(recipientWalletId);
    const staticAccountIds = {
        bankOwnerAccountId: (0, domain_1.toLedgerAccountId)(await caching.getBankOwnerWalletId()),
        dealerBtcAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerBtcWalletId()),
        dealerUsdAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerUsdWalletId()),
    };
    const txMetadataRepo = (0, services_1.TransactionsMetadataRepository)();
    const sharedMetadata = {
        ...metadata,
        username: senderUsername,
        memoPayer: shareMemoWithPayee ? memoPayer : undefined,
    };
    let entry = books_1.MainBook.entry(description);
    const builder = (0, domain_1.LegacyEntryBuilder)({
        staticAccountIds,
        entry,
        metadata: sharedMetadata,
    }).withoutFee();
    if (recipientWalletCurrency === shared_1.WalletCurrency.Btc &&
        senderWalletCurrency === shared_1.WalletCurrency.Btc) {
        if (sats === undefined) {
            return new errors_2.NotReachableError("sats undefined implementation error");
        }
        const satsAmount = (0, shared_1.paymentAmountFromNumber)({
            amount: sats,
            currency: shared_1.WalletCurrency.Btc,
        });
        if (satsAmount instanceof Error)
            return satsAmount;
        entry = builder
            .debitAccount({
            accountId: senderAccountId,
            amount: satsAmount,
            additionalMetadata: {
                memoPayer,
                username: recipientUsername,
            },
        })
            .creditAccount({
            accountId: recipientAccountId,
        });
    }
    else if (recipientWalletCurrency === shared_1.WalletCurrency.Usd &&
        senderWalletCurrency === shared_1.WalletCurrency.Usd) {
        if (cents === undefined) {
            return new Error("cents undefined implementation error");
        }
        const centsAmount = (0, shared_1.paymentAmountFromNumber)({
            amount: cents,
            currency: shared_1.WalletCurrency.Usd,
        });
        if (centsAmount instanceof Error)
            return centsAmount;
        entry = builder
            .debitAccount({
            accountId: senderAccountId,
            amount: centsAmount,
            additionalMetadata: {
                memoPayer,
                username: recipientUsername,
            },
        })
            .creditAccount({
            accountId: recipientAccountId,
        });
    }
    else if (recipientWalletCurrency === shared_1.WalletCurrency.Btc &&
        senderWalletCurrency === shared_1.WalletCurrency.Usd) {
        if (cents === undefined || sats === undefined) {
            return new Error("cents or sats undefined implementation error");
        }
        const centsAmount = (0, shared_1.paymentAmountFromNumber)({
            amount: cents,
            currency: shared_1.WalletCurrency.Usd,
        });
        if (centsAmount instanceof Error)
            return centsAmount;
        const satsAmount = (0, shared_1.paymentAmountFromNumber)({
            amount: sats,
            currency: shared_1.WalletCurrency.Btc,
        });
        if (satsAmount instanceof Error)
            return satsAmount;
        entry = builder
            .debitAccount({
            accountId: senderAccountId,
            amount: centsAmount,
            additionalMetadata: {
                memoPayer,
                username: recipientUsername,
            },
        })
            .creditAccount({
            accountId: recipientAccountId,
            amount: satsAmount,
        });
    }
    else {
        // if (
        //   recipientWalletCurrency === WalletCurrency.Usd &&
        //   senderWalletCurrency === WalletCurrency.Btc
        // )
        if (cents === undefined || sats === undefined) {
            return new Error("cents or sats undefined implementation error");
        }
        const centsAmount = (0, shared_1.paymentAmountFromNumber)({
            amount: cents,
            currency: shared_1.WalletCurrency.Usd,
        });
        if (centsAmount instanceof Error)
            return centsAmount;
        const satsAmount = (0, shared_1.paymentAmountFromNumber)({
            amount: sats,
            currency: shared_1.WalletCurrency.Btc,
        });
        if (satsAmount instanceof Error)
            return satsAmount;
        entry = builder
            .debitAccount({
            accountId: senderAccountId,
            amount: satsAmount,
            additionalMetadata: {
                memoPayer,
                username: recipientUsername,
            },
        })
            .creditAccount({
            accountId: recipientAccountId,
            amount: centsAmount,
        });
    }
    try {
        const savedEntry = await entry.commit();
        const journalEntry = (0, _1.translateToLedgerJournal)(savedEntry);
        const txsMetadataToPersist = journalEntry.transactionIds.map((id) => ({
            id,
            hash: paymentHash,
        }));
        txMetadataRepo.persistAll(txsMetadataToPersist);
        return journalEntry;
    }
    catch (err) {
        return new errors_1.UnknownLedgerError(err);
    }
};
//# sourceMappingURL=intraledger.js.map