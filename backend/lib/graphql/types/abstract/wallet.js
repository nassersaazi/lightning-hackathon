"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dedent_1 = __importDefault(require("dedent"));
const index_1 = require("../../index");
const connections_1 = require("../../connections");
const transaction_1 = require("../object/transaction");
const wallet_currency_1 = __importDefault(require("../scalar/wallet-currency"));
const signed_amount_1 = __importDefault(require("../scalar/signed-amount"));
const on_chain_address_1 = __importDefault(require("../scalar/on-chain-address"));
const IWallet = index_1.GT.Interface({
    name: "Wallet",
    description: "A generic wallet which stores value in one of our supported currencies.",
    fields: () => ({
        id: {
            type: index_1.GT.NonNullID,
        },
        accountId: {
            type: index_1.GT.NonNullID,
        },
        walletCurrency: {
            type: index_1.GT.NonNull(wallet_currency_1.default),
        },
        balance: {
            type: index_1.GT.NonNull(signed_amount_1.default),
        },
        pendingIncomingBalance: {
            type: index_1.GT.NonNull(signed_amount_1.default),
        },
        transactions: {
            description: (0, dedent_1.default) `Transactions are ordered anti-chronologically,
      ie: the newest transaction will be first`,
            type: transaction_1.TransactionConnection,
            args: connections_1.connectionArgs,
            resolve: (source, args) => {
                return (0, connections_1.connectionFromArray)(source.transactions, args);
            },
        },
        transactionsByAddress: {
            description: (0, dedent_1.default) `Transactions are ordered anti-chronologically,
      ie: the newest transaction will be first`,
            type: transaction_1.TransactionConnection,
            args: {
                ...connections_1.connectionArgs,
                address: {
                    type: index_1.GT.NonNull(on_chain_address_1.default),
                    description: "Returns the items that include this address.",
                },
            },
        },
    }),
});
exports.default = IWallet;
//# sourceMappingURL=wallet.js.map