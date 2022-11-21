"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const mutation_1 = require("../../root/mutation");
const connections_1 = require("../../connections");
const error_map_1 = require("../../error-map");
const _app_1 = require("../../../app/index");
const shared_1 = require("../../../domain/shared");
const wallet_1 = __importDefault(require("../abstract/wallet"));
const signed_amount_1 = __importDefault(require("../scalar/signed-amount"));
const wallet_currency_1 = __importDefault(require("../scalar/wallet-currency"));
const on_chain_address_1 = __importDefault(require("../scalar/on-chain-address"));
const transaction_1 = require("./transaction");
const BtcWallet = index_1.GT.Object({
    name: "BTCWallet",
    description: "A wallet belonging to an account which contains a BTC balance and a list of transactions.",
    interfaces: () => [wallet_1.default],
    isTypeOf: (source) => source.currency === shared_1.WalletCurrency.Btc,
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
            description: "A balance stored in BTC.",
            resolve: async (source, args, { logger }) => {
                const balanceSats = await _app_1.Wallets.getBalanceForWallet({
                    walletId: source.id,
                    logger,
                });
                if (balanceSats instanceof Error)
                    throw (0, error_map_1.mapError)(balanceSats);
                return balanceSats;
            },
        },
        pendingIncomingBalance: {
            type: index_1.GT.NonNull(signed_amount_1.default),
            description: "An unconfirmed incoming onchain balance.",
            resolve: async (source) => {
                const balanceSats = await _app_1.Wallets.getPendingOnChainBalanceForWallets([source]);
                if (balanceSats instanceof Error)
                    throw (0, error_map_1.mapError)(balanceSats);
                return (0, mutation_1.normalizePaymentAmount)(balanceSats[source.id]).amount;
            },
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
            description: "A list of BTC transactions associated with this wallet.",
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
exports.default = BtcWallet;
//# sourceMappingURL=btc-wallet.js.map