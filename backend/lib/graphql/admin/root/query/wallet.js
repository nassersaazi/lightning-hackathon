"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../../app/index");
const index_1 = require("../../../index");
const wallet_1 = __importDefault(require("../../../types/abstract/wallet"));
const wallet_id_1 = __importDefault(require("../../../types/scalar/wallet-id"));
const WalletQuery = index_1.GT.Field({
    type: index_1.GT.NonNull(wallet_1.default),
    args: {
        walletId: { type: index_1.GT.NonNull(wallet_id_1.default) },
    },
    resolve: async (_, { walletId }) => _app_1.Wallets.getWallet(walletId),
});
exports.default = WalletQuery;
//# sourceMappingURL=wallet.js.map