"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const _app_1 = require("../../../../app/index");
const transaction_1 = __importDefault(require("../../../types/object/transaction"));
const payment_hash_1 = __importDefault(require("../../../types/scalar/payment-hash"));
const TransactionsByHashQuery = index_1.GT.Field({
    type: index_1.GT.List(transaction_1.default),
    args: {
        hash: { type: index_1.GT.NonNull(payment_hash_1.default) },
    },
    resolve: async (_, { hash }) => {
        if (hash instanceof Error)
            throw hash;
        const ledgerTxs = await _app_1.Wallets.getTransactionsByHash(hash);
        if (ledgerTxs instanceof Error)
            throw ledgerTxs;
        return ledgerTxs;
    },
});
exports.default = TransactionsByHashQuery;
//# sourceMappingURL=transactions-by-hash.js.map