"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const _app_1 = require("../../../../app/index");
const wallet_currency_1 = __importDefault(require("../../../types/scalar/wallet-currency"));
const wallet_id_1 = __importDefault(require("../../../types/scalar/wallet-id"));
const ListWalletIdsQuery = index_1.GT.Field({
    type: index_1.GT.NonNullList(wallet_id_1.default),
    args: {
        walletCurrency: { type: index_1.GT.NonNull(wallet_currency_1.default) },
    },
    resolve: async (_, { walletCurrency }) => _app_1.Wallets.listWalletIds(walletCurrency),
});
exports.default = ListWalletIdsQuery;
//# sourceMappingURL=all-walletids.js.map