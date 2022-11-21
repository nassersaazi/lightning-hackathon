"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const graphql_relay_1 = require("graphql-relay");
const transaction_1 = require("../object/transaction");
const wallet_id_1 = __importDefault(require("../scalar/wallet-id"));
const wallet_1 = __importDefault(require("./wallet"));
const IAccount = index_1.GT.Interface({
    name: "Account",
    fields: () => ({
        id: {
            type: index_1.GT.NonNullID,
        },
        wallets: {
            type: index_1.GT.NonNullList(wallet_1.default),
        },
        defaultWalletId: {
            type: index_1.GT.NonNull(wallet_id_1.default),
        },
        csvTransactions: {
            type: index_1.GT.NonNull(index_1.GT.String),
            args: {
                walletIds: {
                    type: index_1.GT.NonNullList(wallet_id_1.default),
                },
            },
        },
        transactions: {
            type: transaction_1.TransactionConnection,
            args: {
                ...graphql_relay_1.connectionArgs,
                walletIds: {
                    type: index_1.GT.List(wallet_id_1.default),
                },
            },
        },
        // FUTURE-PLAN: Support a `users: [User!]!` field here
    }),
});
exports.default = IAccount;
//# sourceMappingURL=account.js.map