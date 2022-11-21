"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const errors_1 = require("../../../domain/errors");
const error_map_1 = require("../../error-map");
const index_1 = require("../../index");
const username_1 = __importDefault(require("../../types/scalar/username"));
const wallet_currency_1 = __importDefault(require("../../types/scalar/wallet-currency"));
const public_wallet_1 = __importDefault(require("../../types/abstract/public-wallet"));
const mongoose_1 = require("../../../services/mongoose");
const AccountDefaultWalletQuery = index_1.GT.Field({
    type: index_1.GT.NonNull(public_wallet_1.default),
    args: {
        username: {
            type: index_1.GT.NonNull(username_1.default),
        },
        walletCurrency: { type: wallet_currency_1.default },
    },
    resolve: async (_, args) => {
        const { username, walletCurrency } = args;
        if (username instanceof Error) {
            throw username;
        }
        const account = await (0, mongoose_1.AccountsRepository)().findByUsername(username);
        if (account instanceof Error) {
            throw (0, error_map_1.mapError)(account);
        }
        const wallets = await _app_1.Wallets.listWalletsByAccountId(account.id);
        if (wallets instanceof Error)
            throw wallets;
        if (!walletCurrency) {
            return wallets.find((wallet) => wallet.id === account.defaultWalletId);
        }
        const wallet = wallets.find((wallet) => wallet.currency === walletCurrency);
        if (!wallet) {
            throw (0, error_map_1.mapError)(new errors_1.CouldNotFindWalletFromUsernameAndCurrencyError(username));
        }
        return wallet;
    },
});
exports.default = AccountDefaultWalletQuery;
//# sourceMappingURL=account-default-wallet.js.map