"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const _app_1 = require("../../../../app/index");
const transaction_1 = __importDefault(require("../../../types/object/transaction"));
const TransactionByIdQuery = index_1.GT.Field({
    type: transaction_1.default,
    args: {
        id: { type: index_1.GT.NonNullID },
    },
    resolve: async (_, { id }) => {
        if (id instanceof Error)
            throw id;
        const ledgerTx = await _app_1.Wallets.getTransactionById(id);
        if (ledgerTx instanceof Error)
            throw ledgerTx;
        return ledgerTx;
    },
});
exports.default = TransactionByIdQuery;
//# sourceMappingURL=transaction-by-id.js.map