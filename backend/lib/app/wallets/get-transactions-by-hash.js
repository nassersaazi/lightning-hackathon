"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsByHash = void 0;
const ledger_1 = require("../../services/ledger");
const wallets_1 = require("../../domain/wallets");
const getTransactionsByHash = async (hash) => {
    const ledger = (0, ledger_1.LedgerService)();
    const ledgerTransactions = await ledger.getTransactionsByHash(hash);
    if (ledgerTransactions instanceof Error)
        return ledgerTransactions;
    return wallets_1.WalletTransactionHistory.fromLedger(ledgerTransactions).transactions;
};
exports.getTransactionsByHash = getTransactionsByHash;
//# sourceMappingURL=get-transactions-by-hash.js.map