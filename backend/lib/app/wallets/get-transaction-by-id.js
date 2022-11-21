"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionById = void 0;
const ledger_1 = require("../../services/ledger");
const wallets_1 = require("../../domain/wallets");
const ledger_2 = require("../../domain/ledger");
const getTransactionById = async (id) => {
    const ledger = (0, ledger_1.LedgerService)();
    const ledgerTxId = (0, ledger_2.checkedToLedgerTransactionId)(id);
    if (ledgerTxId instanceof Error)
        return ledgerTxId;
    const ledgerTransaction = await ledger.getTransactionById(ledgerTxId);
    if (ledgerTransaction instanceof Error)
        return ledgerTransaction;
    return wallets_1.WalletTransactionHistory.fromLedger([ledgerTransaction]).transactions[0];
};
exports.getTransactionById = getTransactionById;
//# sourceMappingURL=get-transaction-by-id.js.map