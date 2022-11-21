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
exports.receive = void 0;
const shared_1 = require("../../domain/shared");
const errors_1 = require("../../domain/errors");
const bitcoin_1 = require("../../domain/bitcoin");
const fiat_1 = require("../../domain/fiat");
const ledger_1 = require("../../domain/ledger");
const errors_2 = require("../../domain/ledger/errors");
const books_1 = require("./books");
const caching = __importStar(require("./caching"));
const domain_1 = require("./domain");
const services_1 = require("./services");
const _1 = require(".");
const txMetadataRepo = (0, services_1.TransactionsMetadataRepository)();
exports.receive = {
    addOnChainTxReceive: async ({ walletId, walletCurrency, txHash, sats, fee, feeDisplayCurrency, amountDisplayCurrency, receivingAddress, }) => {
        const metadata = {
            type: ledger_1.LedgerTransactionType.OnchainReceipt,
            pending: false,
            hash: txHash,
            fee,
            feeUsd: feeDisplayCurrency,
            usd: amountDisplayCurrency,
            payee_addresses: [receivingAddress],
        };
        const description = "";
        if (fee > 0) {
            return addReceiptFee({
                metadata,
                walletId,
                walletCurrency,
                sats,
                fee,
                description,
            });
        }
        else {
            return addReceiptNoFee({
                metadata,
                walletId,
                walletCurrency,
                sats,
                description,
            });
        }
    },
    addLnTxReceive: async ({ walletId, walletCurrency, paymentHash, description, sats, feeInboundLiquidityDisplayCurrency, amountDisplayCurrency, feeInboundLiquidity, cents, }) => {
        const metadata = {
            type: ledger_1.LedgerTransactionType.Invoice,
            pending: false,
            hash: paymentHash,
            fee: feeInboundLiquidity,
            feeUsd: feeInboundLiquidityDisplayCurrency,
            usd: amountDisplayCurrency,
        };
        if (feeInboundLiquidity > 0) {
            return addReceiptFee({
                metadata,
                walletId,
                walletCurrency,
                sats,
                fee: feeInboundLiquidity,
                description,
            });
        }
        else {
            return addReceiptNoFee({
                metadata,
                walletId,
                walletCurrency,
                sats,
                cents,
                description,
            });
        }
    },
    // this use case run for a lightning payment (not on an initial receive),
    // when the sender overpaid in fee;
    // the bankowner needs to reimburse the end user
    addLnFeeReimbursementReceive: async ({ walletId, walletCurrency, paymentHash, journalId, sats, cents, revealedPreImage, paymentFlow, feeDisplayCurrency, amountDisplayCurrency, displayCurrency, }) => {
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
        const description = "fee reimbursement";
        return addReceiptNoFee({
            metadata,
            description,
            walletId,
            sats,
            walletCurrency,
            cents,
            revealedPreImage,
        });
    },
};
const addReceiptNoFee = async ({ metadata: metaInput, walletId, walletCurrency, sats, cents, description, revealedPreImage, }) => {
    const accountId = (0, domain_1.toLedgerAccountId)(walletId);
    const staticAccountIds = {
        bankOwnerAccountId: (0, domain_1.toLedgerAccountId)(await caching.getBankOwnerWalletId()),
        dealerBtcAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerBtcWalletId()),
        dealerUsdAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerUsdWalletId()),
    };
    const satsAmount = (0, shared_1.paymentAmountFromNumber)({
        amount: sats,
        currency: shared_1.WalletCurrency.Btc,
    });
    if (satsAmount instanceof Error)
        return satsAmount;
    let entry = books_1.MainBook.entry(description);
    const builder = (0, domain_1.LegacyEntryBuilder)({
        staticAccountIds,
        entry,
        metadata: metaInput,
    })
        .withoutFee()
        .debitLnd(satsAmount);
    if (walletCurrency === shared_1.WalletCurrency.Btc) {
        entry = builder.creditAccount({ accountId });
    }
    else {
        if (cents === undefined)
            return new errors_1.NotReachableError("cents should be defined here");
        const centsAmount = (0, shared_1.paymentAmountFromNumber)({
            amount: cents,
            currency: shared_1.WalletCurrency.Usd,
        });
        if (centsAmount instanceof Error)
            return centsAmount;
        entry = builder.creditAccount({
            accountId,
            amount: centsAmount,
        });
    }
    try {
        const savedEntry = await entry.commit();
        const journalEntry = (0, _1.translateToLedgerJournal)(savedEntry);
        const txsMetadataToPersist = journalEntry.transactionIds.map((id) => ({
            id,
            hash: metaInput.hash,
            revealedPreImage,
        }));
        txMetadataRepo.persistAll(txsMetadataToPersist);
        return journalEntry;
    }
    catch (err) {
        return new errors_2.UnknownLedgerError(err);
    }
};
const addReceiptFee = async ({ metadata: metaInput, fee, walletId, walletCurrency, sats, description, }) => {
    const accountId = (0, domain_1.toLedgerAccountId)(walletId);
    const staticAccountIds = {
        bankOwnerAccountId: (0, domain_1.toLedgerAccountId)(await caching.getBankOwnerWalletId()),
        dealerBtcAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerBtcWalletId()),
        dealerUsdAccountId: (0, domain_1.toLedgerAccountId)(await caching.getDealerUsdWalletId()),
    };
    // TODO: remove once implemented
    if (walletCurrency !== shared_1.WalletCurrency.Btc) {
        return new errors_1.NotImplementedError("USD Intraledger");
    }
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
        .debitLnd(satsAmount)
        .creditAccount({ accountId });
    try {
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
//# sourceMappingURL=receive.js.map