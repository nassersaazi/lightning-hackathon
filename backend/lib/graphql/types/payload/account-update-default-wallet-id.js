"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const consumer_account_1 = __importDefault(require("../object/consumer-account"));
const AccountUpdateDefaultWalletIdPayload = index_1.GT.Object({
    name: "AccountUpdateDefaultWalletIdPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        account: {
            type: consumer_account_1.default,
        },
    }),
});
exports.default = AccountUpdateDefaultWalletIdPayload;
//# sourceMappingURL=account-update-default-wallet-id.js.map