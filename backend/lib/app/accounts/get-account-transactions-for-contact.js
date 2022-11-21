"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountTransactionsForContact = void 0;
const ledger_1 = require("../../domain/ledger");
const wallets_1 = require("../../domain/wallets");
const ledger_2 = require("../../services/ledger");
const mongoose_1 = require("../../services/mongoose");
const getAccountTransactionsForContact = async ({ account, contactUsername, }) => {
    const ledger = (0, ledger_2.LedgerService)();
    let transactions = [];
    const wallets = await (0, mongoose_1.WalletsRepository)().listByAccountId(account.id);
    if (wallets instanceof Error)
        return wallets;
    for (const wallet of wallets) {
        const ledgerTransactions = await ledger.getTransactionsByWalletIdAndContactUsername(wallet.id, contactUsername);
        if (ledgerTransactions instanceof ledger_1.LedgerError)
            return ledgerTransactions;
        const confirmedHistory = wallets_1.WalletTransactionHistory.fromLedger(ledgerTransactions);
        transactions = transactions.concat(confirmedHistory.transactions);
    }
    return transactions;
};
exports.getAccountTransactionsForContact = getAccountTransactionsForContact;
//# sourceMappingURL=get-account-transactions-for-contact.js.map