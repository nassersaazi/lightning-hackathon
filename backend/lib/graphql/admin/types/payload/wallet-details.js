"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const error_1 = __importDefault(require("../../../types/abstract/error"));
const wallet_1 = __importDefault(require("../../../types/abstract/wallet"));
const WalletDetailsPayload = index_1.GT.Object({
    name: "WalletDetailsPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        walletDetails: {
            type: index_1.GT.NonNullList(wallet_1.default),
        },
    }),
});
exports.default = WalletDetailsPayload;
//# sourceMappingURL=wallet-details.js.map