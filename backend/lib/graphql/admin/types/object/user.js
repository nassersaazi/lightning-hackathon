"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../../app/index");
const index_1 = require("../../../index");
const language_1 = __importDefault(require("../../../types/scalar/language"));
const phone_1 = __importDefault(require("../../../types/scalar/phone"));
const timestamp_1 = __importDefault(require("../../../types/scalar/timestamp"));
const account_1 = __importDefault(require("./account"));
const User = index_1.GT.Object({
    name: "User",
    fields: () => ({
        id: { type: index_1.GT.NonNullID },
        phone: { type: index_1.GT.NonNull(phone_1.default) },
        language: { type: index_1.GT.NonNull(language_1.default) },
        defaultAccount: {
            type: index_1.GT.NonNull(account_1.default),
            resolve: async (source) => {
                const account = await _app_1.Accounts.getAccount(source.defaultAccountId);
                if (account instanceof Error) {
                    throw account;
                }
                return account;
            },
        },
        createdAt: {
            type: index_1.GT.NonNull(timestamp_1.default),
        },
    }),
});
exports.default = User;
//# sourceMappingURL=user.js.map