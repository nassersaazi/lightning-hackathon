"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsForWalletsByAddresses = void 0;
const _config_1 = require("../../config/index");
const prices_1 = require("../prices");
const partial_result_1 = require("../partial-result");
const ledger_1 = require("../../domain/ledger");
const wallets_1 = require("../../domain/wallets");
const onchain_1 = require("../../domain/bitcoin/onchain");
const logger_1 = require("../../services/logger");
const ledger_2 = require("../../services/ledger");
const get_on_chain_txs_1 = require("./private/get-on-chain-txs");
const getTransactionsForWalletsByAddresses = async ({ wallets, addresses, }) => {
    const walletIds = wallets.map((wallet) => wallet.id);
    const ledger = (0, ledger_2.LedgerService)();
    const ledgerTransactionsForWallets = await ledger.getTransactionsByWalletIds(walletIds);
    if (ledgerTransactionsForWallets instanceof ledger_1.LedgerError)
        return partial_result_1.PartialResult.err(ledgerTransactionsForWallets);
    const ledgerTransactions = ledgerTransactionsForWallets.filter((tx) => tx.address && addresses.includes(tx.address));
    const confirmedHistory = wallets_1.WalletTransactionHistory.fromLedger(ledgerTransactions);
    const onChainTxs = await (0, get_on_chain_txs_1.getOnChainTxs)();
    if (onChainTxs instanceof Error) {
        logger_1.baseLogger.warn({ onChainTxs }, "impossible to get listIncomingTransactions");
        return partial_result_1.PartialResult.partial(confirmedHistory.transactions, onChainTxs);
    }
    const allAddresses = [];
    const addressesByWalletId = {};
    const walletDetailsByWalletId = {};
    for (const wallet of wallets) {
        const walletAddresses = wallet.onChainAddresses();
        addressesByWalletId[wallet.id] = walletAddresses;
        allAddresses.push(...walletAddresses);
        walletDetailsByWalletId[wallet.id] = { currency: wallet.currency };
    }
    const addressesForWallets = addresses.filter((address) => allAddresses.includes(address));
    const filter = (0, onchain_1.TxFilter)({
        confirmationsLessThan: _config_1.ONCHAIN_MIN_CONFIRMATIONS,
        addresses: addressesForWallets,
    });
    const pendingIncoming = filter.apply(onChainTxs);
    let price = await (0, prices_1.getCurrentPrice)();
    if (price instanceof Error) {
        price = NaN;
    }
    return partial_result_1.PartialResult.ok(confirmedHistory.addPendingIncoming({
        pendingIncoming,
        addressesByWalletId,
        walletDetailsByWalletId,
        displayCurrencyPerSat: price,
    }).transactions);
};
exports.getTransactionsForWalletsByAddresses = getTransactionsForWalletsByAddresses;
//# sourceMappingURL=get-transactions-by-addresses.js.map