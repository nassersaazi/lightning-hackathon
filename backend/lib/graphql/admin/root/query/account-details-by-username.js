"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const account_1 = __importDefault(require("../../types/object/account"));
const username_1 = __importDefault(require("../../../types/scalar/username"));
const _app_1 = require("../../../../app/index");
const AccountDetailsByUsernameQuery = index_1.GT.Field({
    type: index_1.GT.NonNull(account_1.default),
    args: {
        username: { type: index_1.GT.NonNull(username_1.default) },
    },
    resolve: async (parent, { username }) => {
        if (username instanceof Error) {
            throw username;
        }
        const account = await _app_1.Admin.getAccountByUsername(username);
        if (account instanceof Error) {
            throw account;
        }
        return account;
    },
});
exports.default = AccountDetailsByUsernameQuery;
//# sourceMappingURL=account-details-by-username.js.map