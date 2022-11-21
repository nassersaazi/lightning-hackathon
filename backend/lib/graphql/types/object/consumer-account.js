"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../../domain/errors");
const index_1 = require("../../index");
const error_map_1 = require("../../error-map");
const connections_1 = require("../../connections");
const mongoose_1 = require("../../../services/mongoose");
const _app_1 = require("../../../app/index");
const uuid_by_string_1 = __importDefault(require("uuid-by-string"));
const account_1 = __importDefault(require("../abstract/account"));
const wallet_1 = __importDefault(require("../abstract/wallet"));
const wallet_id_1 = __importDefault(require("../scalar/wallet-id"));
const transaction_1 = require("./transaction");
const ConsumerAccount = index_1.GT.Object({
    name: "ConsumerAccount",
    interfaces: () => [account_1.default],
    isTypeOf: () => true,
    fields: () => ({
        id: {
            type: index_1.GT.NonNullID,
            resolve: (source) => (0, uuid_by_string_1.default)(source.id),
        },
        wallets: {
            type: index_1.GT.NonNullList(wallet_1.default),
            resolve: async (source) => {
                return _app_1.Wallets.listWalletsByAccountId(source.id);
            },
        },
        defaultWalletId: {
            type: index_1.GT.NonNull(wallet_id_1.default),
            resolve: (source) => source.defaultWalletId,
        },
        csvTransactions: {
            description: "return CSV stream, base64 encoded, of the list of transactions in the wallet",
            type: index_1.GT.NonNull(index_1.GT.String),
            args: {
                walletIds: {
                    type: index_1.GT.NonNullList(wallet_id_1.default),
                },
            },
            resolve: async (source) => {
                return _app_1.Accounts.getCSVForAccount(source.id);
            },
        },
        transactions: {
            description: "A list of all transactions associated with walletIds optionally passed.",
            type: transaction_1.TransactionConnection,
            args: {
                ...connections_1.connectionArgs,
                walletIds: {
                    type: index_1.GT.List(wallet_id_1.default),
                },
            },
            resolve: async (source, args) => {
                let { walletIds } = args;
                if (walletIds instanceof Error) {
                    return { errors: [{ message: walletIds.message }] };
                }
                if (walletIds === undefined) {
                    const wallets = await (0, mongoose_1.WalletsRepository)().listByAccountId(source.id);
                    if (wallets instanceof Error) {
                        return { errors: [{ message: walletIds.message }] };
                    }
                    walletIds = wallets.map((wallet) => wallet.id);
                }
                const { result: transactions, error } = await _app_1.Accounts.getTransactionsForAccountByWalletIds({
                    account: source,
                    walletIds,
                });
                if (error instanceof Error) {
                    throw (0, error_map_1.mapError)(error);
                }
                if (transactions === null) {
                    const nullError = new errors_1.CouldNotFindTransactionsForAccountError();
                    throw (0, error_map_1.mapError)(nullError);
                }
                return (0, connections_1.connectionFromArray)(transactions, args);
            },
        },
    }),
});
exports.default = ConsumerAccount;
//# sourceMappingURL=consumer-account.js.map