"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const connections_1 = require("../../connections");
const helpers_1 = require("../../helpers");
const error_map_1 = require("../../error-map");
const _app_1 = require("../../../app/index");
const shared_1 = require("../../../domain/shared");
const wallet_1 = __importDefault(require("../abstract/wallet"));
const wallet_currency_1 = __importDefault(require("../scalar/wallet-currency"));
const signed_amount_1 = __importDefault(require("../scalar/signed-amount"));
const on_chain_address_1 = __importDefault(require("../scalar/on-chain-address"));
const transaction_1 = require("./transaction");
const UsdWallet = index_1.GT.Object({
    name: "UsdWallet",
    description: "A wallet belonging to an account which contains a USD balance and a list of transactions.",
    interfaces: () => [wallet_1.default],
    isTypeOf: (source) => source.currency === shared_1.WalletCurrency.Usd,
    fields: () => ({
        id: {
            type: index_1.GT.NonNullID,
        },
        accountId: {
            type: index_1.GT.NonNullID,
        },
        walletCurrency: {
            type: index_1.GT.NonNull(wallet_currency_1.default),
            resolve: (source) => source.currency,
        },
        balance: {
            type: index_1.GT.NonNull(signed_amount_1.default),
            resolve: async (source, args, { logger }) => {
                const balanceCents = await _app_1.Wallets.getBalanceForWallet({
                    walletId: source.id,
                    logger,
                });
                if (balanceCents instanceof Error)
                    throw (0, error_map_1.mapError)(balanceCents);
                return Math.floor(balanceCents);
            },
        },
        pendingIncomingBalance: {
            type: index_1.GT.NonNull(signed_amount_1.default),
            description: "An unconfirmed incoming onchain balance.",
            resolve: () => helpers_1.notBtcWalletForQueryError,
        },
        transactions: {
            type: transaction_1.TransactionConnection,
            args: connections_1.connectionArgs,
            resolve: async (source, args) => {
                const { result: transactions, error } = await _app_1.Wallets.getTransactionsForWallets([
                    source,
                ]);
                if (error instanceof Error)
                    throw (0, error_map_1.mapError)(error);
                // Non-null signal to type checker; consider fixing in PartialResult type
                if (transactions === null)
                    throw error;
                return (0, connections_1.connectionFromArray)(transactions, args);
            },
        },
        transactionsByAddress: {
            type: transaction_1.TransactionConnection,
            args: {
                ...connections_1.connectionArgs,
                address: {
                    type: index_1.GT.NonNull(on_chain_address_1.default),
                    description: "Returns the items that include this address.",
                },
            },
            resolve: async (source, args) => {
                const { address } = args;
                if (address instanceof Error)
                    throw address;
                const { result: transactions, error } = await _app_1.Wallets.getTransactionsForWalletsByAddresses({
                    wallets: [source],
                    addresses: [address],
                });
                if (error instanceof Error)
                    throw (0, error_map_1.mapError)(error);
                // Non-null signal to type checker; consider fixing in PartialResult type
                if (transactions === null)
                    throw error;
                return (0, connections_1.connectionFromArray)(transactions, args);
            },
        },
    }),
});
exports.default = UsdWallet;
//# sourceMappingURL=usd-wallet.js.map