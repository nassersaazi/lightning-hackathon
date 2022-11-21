"use strict";
/**
 * an accounting reminder:
 * https://en.wikipedia.org/wiki/Double-entry_bookkeeping
 */
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
exports.translateToLedgerJournal = exports.translateToLedgerTx = exports.LedgerService = exports.lazyLoadLedgerAdmin = exports.getNonEndUserWalletIds = void 0;
const bitcoin_1 = require("../../domain/bitcoin");
const fiat_1 = require("../../domain/fiat");
const ledger_1 = require("../../domain/ledger");
const errors_1 = require("../../domain/errors");
const errors_2 = require("../../domain/ledger/errors");
const shared_1 = require("../../domain/shared");
const utils_1 = require("../mongoose/utils");
const tracing_1 = require("../tracing");
const admin_1 = require("./admin");
const adminLegacy = __importStar(require("./admin-legacy"));
const books_1 = require("./books");
const caching = __importStar(require("./caching"));
const services_1 = require("./services");
const intraledger_1 = require("./intraledger");
const receive_1 = require("./receive");
const send_1 = require("./send");
const volume_1 = require("./volume");
var caching_1 = require("./caching");
Object.defineProperty(exports, "getNonEndUserWalletIds", { enumerable: true, get: function () { return caching_1.getNonEndUserWalletIds; } });
const lazyLoadLedgerAdmin = ({ bankOwnerWalletResolver, dealerBtcWalletResolver, dealerUsdWalletResolver, funderWalletResolver, }) => {
    caching.setBankOwnerWalletResolver(bankOwnerWalletResolver);
    caching.setDealerBtcWalletResolver(dealerBtcWalletResolver);
    caching.setDealerUsdWalletResolver(dealerUsdWalletResolver);
    caching.setFunderWalletResolver(funderWalletResolver);
    return {
        ...adminLegacy,
    };
};
exports.lazyLoadLedgerAdmin = lazyLoadLedgerAdmin;
const LedgerService = () => {
    const updateMetadataByHash = async (ledgerTxMetadata) => (0, services_1.TransactionsMetadataRepository)().updateByHash(ledgerTxMetadata);
    const getTransactionById = async (id) => {
        try {
            const _id = (0, utils_1.toObjectId)(id);
            const { results } = await books_1.MainBook.ledger({
                account: ledger_1.liabilitiesMainAccount,
                _id,
            });
            if (results.length === 1) {
                return (0, exports.translateToLedgerTx)(results[0]);
            }
            return new errors_2.CouldNotFindTransactionError();
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    };
    const getTransactionsByHash = async (hash) => {
        try {
            const { results } = await books_1.MainBook.ledger({
                hash,
                account: ledger_1.liabilitiesMainAccount,
            });
            /* eslint @typescript-eslint/ban-ts-comment: "off" */
            // @ts-ignore-next-line no-implicit-any error
            return results.map((tx) => (0, exports.translateToLedgerTx)(tx));
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    };
    const getTransactionsByWalletId = async (walletId) => {
        const liabilitiesWalletId = (0, ledger_1.toLiabilitiesWalletId)(walletId);
        try {
            const { results } = await books_1.MainBook.ledger({
                account: liabilitiesWalletId,
            });
            // @ts-ignore-next-line no-implicit-any error
            return results.map((tx) => (0, exports.translateToLedgerTx)(tx));
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    };
    const getTransactionsByWalletIds = async (walletIds) => {
        const liabilitiesWalletIds = walletIds.map(ledger_1.toLiabilitiesWalletId);
        try {
            const { results } = await books_1.MainBook.ledger({
                account: liabilitiesWalletIds,
            });
            // @ts-ignore-next-line no-implicit-any error
            return results.map((tx) => (0, exports.translateToLedgerTx)(tx));
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    };
    const getTransactionsByWalletIdAndContactUsername = async (walletId, 
    // @ts-ignore-next-line no-implicit-any error
    contactUsername) => {
        const liabilitiesWalletId = (0, ledger_1.toLiabilitiesWalletId)(walletId);
        try {
            const { results } = await books_1.MainBook.ledger({
                account: liabilitiesWalletId,
                username: contactUsername,
            });
            // @ts-ignore-next-line no-implicit-any error
            return results.map((tx) => (0, exports.translateToLedgerTx)(tx));
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    };
    const listPendingPayments = async (walletId) => {
        const liabilitiesWalletId = (0, ledger_1.toLiabilitiesWalletId)(walletId);
        try {
            const { results } = await books_1.MainBook.ledger({
                account: liabilitiesWalletId,
                type: ledger_1.LedgerTransactionType.Payment,
                pending: true,
            });
            // @ts-ignore-next-line no-implicit-any error
            return results.map((tx) => (0, exports.translateToLedgerTx)(tx));
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    };
    async function* listAllPaymentHashes() {
        try {
            const agg = books_1.Transaction.aggregate()
                .match({ type: ledger_1.LedgerTransactionType.Payment })
                .group({
                _id: "$hash",
                createdAt: { $first: "$timestamp" },
            })
                .sort({ createdAt: -1 })
                .cursor({ batchSize: 100 });
            for await (const { _id } of agg) {
                yield _id;
            }
        }
        catch (err) {
            yield new errors_2.UnknownLedgerError(err);
        }
    }
    const getPendingPaymentsCount = async (walletId) => {
        const liabilitiesWalletId = (0, ledger_1.toLiabilitiesWalletId)(walletId);
        return books_1.Transaction.countDocuments({
            accounts: liabilitiesWalletId,
            type: ledger_1.LedgerTransactionType.Payment,
            pending: true,
        });
    };
    const getWalletBalance = async (walletId) => {
        const liabilitiesWalletId = (0, ledger_1.toLiabilitiesWalletId)(walletId);
        try {
            const { balance } = await books_1.MainBook.balance({
                account: liabilitiesWalletId,
            });
            if (balance < 0) {
                const dealerUsdWalletId = await caching.getDealerUsdWalletId();
                const dealerBtcWalletId = await caching.getDealerBtcWalletId();
                if (walletId !== dealerUsdWalletId && walletId !== dealerBtcWalletId) {
                    (0, tracing_1.recordExceptionInCurrentSpan)({
                        error: new errors_1.BalanceLessThanZeroError(balance.toString()),
                        attributes: {
                            "getWalletBalance.error.invalidBalance": `${balance}`,
                        },
                        level: shared_1.ErrorLevel.Critical,
                    });
                }
            }
            return (0, bitcoin_1.toSats)(balance);
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    };
    const getWalletBalanceAmount = async (walletDescriptor) => {
        const liabilitiesWalletId = (0, ledger_1.toLiabilitiesWalletId)(walletDescriptor.id);
        try {
            const { balance } = await books_1.MainBook.balance({
                account: liabilitiesWalletId,
            });
            if (balance < 0) {
                const dealerWalletIds = Object.values(await caching.getDealerWalletIds());
                if (!dealerWalletIds.includes(walletDescriptor.id)) {
                    (0, tracing_1.recordExceptionInCurrentSpan)({
                        error: new errors_1.BalanceLessThanZeroError(balance.toString()),
                        attributes: {
                            "getWalletBalance.error.invalidBalance": `${balance}`,
                        },
                        level: shared_1.ErrorLevel.Critical,
                    });
                }
            }
            const balanceAmount = (0, shared_1.balanceAmountFromNumber)({
                amount: balance,
                currency: walletDescriptor.currency,
            });
            // FIXME: correct database entries in staging/prod to remove this check
            if (balanceAmount instanceof shared_1.BigIntFloatConversionError) {
                (0, tracing_1.recordExceptionInCurrentSpan)({
                    error: balanceAmount,
                    level: shared_1.ErrorLevel.Critical,
                    attributes: {
                        ["error.message"]: `Inconsistent float balance from db: ${balance}`,
                    },
                });
                return (0, shared_1.balanceAmountFromNumber)({
                    amount: Math.floor(balance),
                    currency: walletDescriptor.currency,
                });
            }
            return balanceAmount;
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    };
    const isOnChainTxRecorded = async ({ walletId, txHash, }) => {
        const liabilitiesWalletId = (0, ledger_1.toLiabilitiesWalletId)(walletId);
        try {
            const result = await books_1.Transaction.countDocuments({
                accounts: liabilitiesWalletId,
                type: ledger_1.LedgerTransactionType.OnchainReceipt,
                hash: txHash,
            });
            return result > 0;
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    };
    const isLnTxRecorded = async (paymentHash) => {
        try {
            const { total } = await books_1.MainBook.ledger({
                pending: false,
                hash: paymentHash,
            });
            return total > 0;
        }
        catch (err) {
            return new errors_2.UnknownLedgerError(err);
        }
    };
    const getWalletIdByTransactionHash = async (hash) => {
        const bankOwnerWalletId = await caching.getBankOwnerWalletId();
        const bankOwnerPath = (0, ledger_1.toLiabilitiesWalletId)(bankOwnerWalletId);
        const entry = await books_1.Transaction.findOne({
            account_path: ledger_1.liabilitiesMainAccount,
            accounts: { $ne: bankOwnerPath },
            hash,
        });
        if (!entry) {
            return new errors_2.CouldNotFindTransactionError();
        }
        const walletId = (0, ledger_1.toWalletId)(entry.accounts);
        if (!walletId) {
            return new errors_2.UnknownLedgerError("no wallet id associated to transaction");
        }
        return walletId;
    };
    const listWalletIdsWithPendingPayments = async function* () {
        let transactions;
        try {
            transactions = books_1.Transaction.aggregate([
                {
                    $match: {
                        type: "payment",
                        pending: true,
                        account_path: ledger_1.liabilitiesMainAccount,
                    },
                },
                { $group: { _id: "$accounts" } },
            ]).cursor({ batchSize: 100 });
        }
        catch (error) {
            return new errors_2.UnknownLedgerError(error);
        }
        for await (const { _id } of transactions) {
            yield (0, ledger_1.toWalletId)(_id);
        }
    };
    return (0, tracing_1.wrapAsyncFunctionsToRunInSpan)({
        namespace: "services.ledger",
        fns: {
            updateMetadataByHash,
            getTransactionById,
            getTransactionsByHash,
            getTransactionsByWalletId,
            getTransactionsByWalletIds,
            getTransactionsByWalletIdAndContactUsername,
            listPendingPayments,
            listAllPaymentHashes,
            getPendingPaymentsCount,
            getWalletBalance,
            getWalletBalanceAmount,
            isOnChainTxRecorded,
            isLnTxRecorded,
            getWalletIdByTransactionHash,
            listWalletIdsWithPendingPayments,
            ...admin_1.admin,
            ...intraledger_1.intraledger,
            ...volume_1.volume,
            ...send_1.send,
            ...receive_1.receive,
        },
    });
};
exports.LedgerService = LedgerService;
const translateToLedgerTx = (tx) => ({
    id: (0, utils_1.fromObjectId)(tx._id || ""),
    walletId: (0, ledger_1.toWalletId)(tx.accounts),
    type: tx.type,
    debit: (0, bitcoin_1.toSats)(tx.debit),
    credit: (0, bitcoin_1.toSats)(tx.credit),
    fee: (0, bitcoin_1.toSats)(tx.fee || 0),
    usd: tx.usd || 0,
    feeUsd: tx.feeUsd || 0,
    currency: tx.currency,
    timestamp: tx.timestamp,
    pendingConfirmation: tx.pending,
    journalId: tx._journal.toString(),
    lnMemo: tx.memo,
    username: tx.username || undefined,
    memoFromPayer: tx.memoPayer,
    paymentHash: tx.hash || undefined,
    pubkey: tx.pubkey || undefined,
    address: tx.payee_addresses && tx.payee_addresses.length > 0
        ? tx.payee_addresses[0]
        : undefined,
    txHash: tx.hash || undefined,
    feeKnownInAdvance: tx.feeKnownInAdvance || false,
    satsAmount: tx.satsAmount !== undefined ? (0, bitcoin_1.toSats)(tx.satsAmount) : undefined,
    centsAmount: tx.centsAmount !== undefined ? (0, fiat_1.toCents)(tx.centsAmount) : undefined,
    satsFee: tx.satsFee !== undefined ? (0, bitcoin_1.toSats)(tx.satsFee) : undefined,
    centsFee: tx.centsFee !== undefined ? (0, fiat_1.toCents)(tx.centsFee) : undefined,
    displayAmount: tx.displayAmount !== undefined
        ? tx.displayAmount
        : undefined,
    displayFee: tx.displayFee !== undefined
        ? tx.displayFee
        : undefined,
    displayCurrency: tx.displayCurrency !== undefined
        ? tx.displayCurrency
        : undefined,
});
exports.translateToLedgerTx = translateToLedgerTx;
// @ts-ignore-next-line no-implicit-any error
const translateToLedgerJournal = (savedEntry) => ({
    journalId: savedEntry._id.toString(),
    voided: savedEntry.voided,
    // @ts-ignore-next-line no-implicit-any error
    transactionIds: savedEntry._transactions.map((id) => id.toString()),
});
exports.translateToLedgerJournal = translateToLedgerJournal;
//# sourceMappingURL=index.js.map