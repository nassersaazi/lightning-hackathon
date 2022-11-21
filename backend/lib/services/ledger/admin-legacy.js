"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLndRoutingRevenue = exports.addLndChannelOpeningOrClosingFee = exports.updateLndEscrow = exports.getBankOwnerBalance = exports.getBitcoindBalance = exports.getLndEscrowBalance = exports.getLndBalance = exports.getLiabilitiesBalance = exports.getAssetsBalance = void 0;
const ledger_1 = require("../../domain/ledger");
const shared_1 = require("../../domain/shared");
const accounts_1 = require("./accounts");
const books_1 = require("./books");
const caching_1 = require("./caching");
const getWalletBalance = async (account, query = {}) => {
    const params = { account, currency: "BTC", ...query };
    const { balance } = await books_1.MainBook.balance(params);
    return balance;
};
const getAssetsBalance = (currency = "BTC") => getWalletBalance(accounts_1.assetsMainAccount, { currency });
exports.getAssetsBalance = getAssetsBalance;
const getLiabilitiesBalance = (currency = "BTC") => getWalletBalance(ledger_1.liabilitiesMainAccount, { currency });
exports.getLiabilitiesBalance = getLiabilitiesBalance;
const getLndBalance = () => getWalletBalance(accounts_1.lndAccountingPath);
exports.getLndBalance = getLndBalance;
const getLndEscrowBalance = () => getWalletBalance(accounts_1.escrowAccountingPath);
exports.getLndEscrowBalance = getLndEscrowBalance;
const getBitcoindBalance = () => getWalletBalance(accounts_1.bitcoindAccountingPath);
exports.getBitcoindBalance = getBitcoindBalance;
const getBankOwnerBalance = async (currency = "BTC") => {
    const bankOwnerPath = (0, ledger_1.toLiabilitiesWalletId)(await (0, caching_1.getBankOwnerWalletId)());
    return getWalletBalance(bankOwnerPath, { currency });
};
exports.getBankOwnerBalance = getBankOwnerBalance;
const updateLndEscrow = async (amount) => {
    const ledgerEscrow = await (0, exports.getLndEscrowBalance)();
    // ledgerEscrow is negative
    // diff will equal 0 if there is no change
    const diff = amount + ledgerEscrow;
    const escrowData = { ledgerPrevAmount: ledgerEscrow, lndAmount: amount, diff };
    if (diff === 0) {
        return { ...escrowData, updated: false };
    }
    const entry = books_1.MainBook.entry("escrow");
    const metadata = {
        type: ledger_1.LedgerTransactionType.Escrow,
        currency: shared_1.WalletCurrency.Btc,
        pending: false,
    };
    if (diff > 0) {
        entry
            .credit(accounts_1.lndAccountingPath, diff, metadata)
            .debit(accounts_1.escrowAccountingPath, diff, metadata);
    }
    else if (diff < 0) {
        entry
            .debit(accounts_1.lndAccountingPath, -diff, metadata)
            .credit(accounts_1.escrowAccountingPath, -diff, metadata);
    }
    await entry.commit();
    return { ...escrowData, updated: true };
};
exports.updateLndEscrow = updateLndEscrow;
const addLndChannelOpeningOrClosingFee = async ({ description, fee, metadata, }) => {
    const txMetadata = {
        currency: shared_1.WalletCurrency.Btc,
        type: ledger_1.LedgerTransactionType.Fee,
        pending: false,
        ...metadata,
    };
    const bankOwnerPath = (0, ledger_1.toLiabilitiesWalletId)(await (0, caching_1.getBankOwnerWalletId)());
    try {
        await books_1.MainBook.entry(description)
            .debit(bankOwnerPath, fee, txMetadata)
            .credit(accounts_1.lndAccountingPath, fee, txMetadata)
            .commit();
        return true;
    }
    catch (err) {
        return new ledger_1.UnknownLedgerError(err);
    }
};
exports.addLndChannelOpeningOrClosingFee = addLndChannelOpeningOrClosingFee;
const addLndRoutingRevenue = async ({ amount, collectedOn, }) => {
    const metadata = {
        type: ledger_1.LedgerTransactionType.RoutingRevenue,
        currency: shared_1.WalletCurrency.Btc,
        feesCollectedOn: collectedOn,
        pending: false,
    };
    const bankOwnerPath = (0, ledger_1.toLiabilitiesWalletId)(await (0, caching_1.getBankOwnerWalletId)());
    try {
        await books_1.MainBook.entry("routing fee")
            .credit(bankOwnerPath, amount, metadata)
            .debit(accounts_1.lndAccountingPath, amount, metadata)
            .commit();
        return true;
    }
    catch (err) {
        return new ledger_1.UnknownLedgerError(err);
    }
};
exports.addLndRoutingRevenue = addLndRoutingRevenue;
//# sourceMappingURL=admin-legacy.js.map