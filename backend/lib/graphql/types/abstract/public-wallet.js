"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const wallet_currency_1 = __importDefault(require("../scalar/wallet-currency"));
const IPublicWallet = index_1.GT.Object({
    name: "PublicWallet",
    description: "A public view of a generic wallet which stores value in one of our supported currencies.",
    fields: () => ({
        id: {
            type: index_1.GT.NonNullID,
        },
        walletCurrency: {
            type: index_1.GT.NonNull(wallet_currency_1.default),
            resolve: (source) => source.currency,
        },
    }),
});
exports.default = IPublicWallet;
//# sourceMappingURL=public-wallet.js.map