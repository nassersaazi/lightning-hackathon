"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
const ledger_1 = require("../../domain/ledger");
const shared_1 = require("../../domain/shared");
const errors_1 = require("../../domain/errors");
const swap_1 = require("../../domain/swap");
const lightning_1 = require("../../domain/bitcoin/lightning");
const accounts_1 = require("./accounts");
const books_1 = require("./books");
const caching_1 = require("./caching");
const services_1 = require("./services");
const _1 = require(".");
const txMetadataRepo = (0, services_1.TransactionsMetadataRepository)();
exports.admin = {
    isToHotWalletTxRecorded: async (txHash) => {
        try {
            const result = await books_1.Transaction.countDocuments({
                type: ledger_1.LedgerTransactionType.ToHotWallet,
                hash: txHash,
            });
            return result > 0;
        }
        catch (err) {
            return new ledger_1.UnknownLedgerError(err);
        }
    },
    addColdStorageTxReceive: async ({ txHash, payeeAddress, description, sats, fee, feeDisplayCurrency, amountDisplayCurrency, }) => {
        const metadata = {
            type: ledger_1.LedgerTransactionType.ToColdStorage,
            pending: false,
            hash: txHash,
            payee_addresses: [payeeAddress],
            fee,
            feeUsd: feeDisplayCurrency,
            usd: amountDisplayCurrency,
            currency: shared_1.WalletCurrency.Btc,
        };
        try {
            const bankOwnerWalletId = await (0, caching_1.getBankOwnerWalletId)();
            const bankOwnerPath = (0, ledger_1.toLiabilitiesWalletId)(bankOwnerWalletId);
            const entry = books_1.MainBook.entry(description)
                .credit(accounts_1.lndAccountingPath, sats + fee, metadata)
                .debit(bankOwnerPath, fee, metadata)
                .debit(accounts_1.bitcoindAccountingPath, sats, metadata);
            const savedEntry = await entry.commit();
            return (0, _1.translateToLedgerJournal)(savedEntry);
        }
        catch (err) {
            return new ledger_1.UnknownLedgerError(err);
        }
    },
    addColdStorageTxSend: async ({ txHash, payeeAddress, description, sats, fee, amountDisplayCurrency, feeDisplayCurrency, }) => {
        const metadata = {
            type: ledger_1.LedgerTransactionType.ToHotWallet,
            pending: false,
            hash: txHash,
            payee_addresses: [payeeAddress],
            fee,
            feeUsd: feeDisplayCurrency,
            usd: amountDisplayCurrency,
            currency: shared_1.WalletCurrency.Btc,
        };
        try {
            const bankOwnerWalletId = await (0, caching_1.getBankOwnerWalletId)();
            const bankOwnerPath = (0, ledger_1.toLiabilitiesWalletId)(bankOwnerWalletId);
            const entry = books_1.MainBook.entry(description)
                .credit(accounts_1.bitcoindAccountingPath, sats + fee, metadata)
                .debit(bankOwnerPath, fee, metadata)
                .debit(accounts_1.lndAccountingPath, sats, metadata);
            const savedEntry = await entry.commit();
            return (0, _1.translateToLedgerJournal)(savedEntry);
        }
        catch (err) {
            return new ledger_1.UnknownLedgerError(err);
        }
    },
    addSwapFeeTxSend: async (swapResult) => {
        const swapFeeMetadata = {
            hash: (0, lightning_1.sha256)(Buffer.from(swapResult.id)),
            swapId: swapResult.id,
            swapAmount: Number(swapResult.amt),
            htlcAddress: swapResult.htlcAddress,
            onchainMinerFee: Number(swapResult.onchainMinerFee),
            offchainRoutingFee: Number(swapResult.offchainRoutingFee),
            serviceProviderFee: Number(swapResult.serviceProviderFee),
            serviceProvider: swap_1.SwapProvider.Loop,
            currency: shared_1.WalletCurrency.Btc,
            type: ledger_1.LedgerTransactionType.Fee,
        };
        const description = `Swap out fee for swapId ${swapFeeMetadata.swapId}`;
        const totalSwapFee = swapFeeMetadata.offchainRoutingFee +
            swapFeeMetadata.onchainMinerFee +
            swapFeeMetadata.serviceProviderFee;
        try {
            // check for duplicates
            const result = await txMetadataRepo.findByHash(swapFeeMetadata.hash);
            if (result instanceof ledger_1.CouldNotFindTransactionMetadataError) {
                const bankOwnerWalletId = await (0, caching_1.getBankOwnerWalletId)();
                const bankOwnerPath = (0, ledger_1.toLiabilitiesWalletId)(bankOwnerWalletId);
                const entry = books_1.MainBook.entry(description)
                    .credit(accounts_1.lndAccountingPath, Number(totalSwapFee), {
                    currency: shared_1.WalletCurrency.Btc,
                    pending: false,
                    type: ledger_1.LedgerTransactionType.Fee,
                })
                    .debit(bankOwnerPath, Number(totalSwapFee), {
                    currency: shared_1.WalletCurrency.Btc,
                    pending: false,
                    type: ledger_1.LedgerTransactionType.Fee,
                });
                const saved = await entry.commit();
                const journalEntry = (0, _1.translateToLedgerJournal)(saved);
                const txsMetadataToPersist = journalEntry.transactionIds.map((id) => ({
                    id,
                    hash: swapFeeMetadata.hash,
                    swap: swapFeeMetadata,
                }));
                const metadataResults = await txMetadataRepo.persistAll(txsMetadataToPersist);
                if (metadataResults instanceof Error)
                    return metadataResults;
                return journalEntry;
            }
            else {
                return new errors_1.DuplicateError();
            }
        }
        catch (error) {
            return new ledger_1.UnknownLedgerError(error);
        }
    },
};
//# sourceMappingURL=admin.js.map