"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const account_1 = __importDefault(require("../../types/object/account"));
const phone_1 = __importDefault(require("../../../types/scalar/phone"));
const _app_1 = require("../../../../app/index");
const AccountDetailsByUserPhoneQuery = index_1.GT.Field({
    type: index_1.GT.NonNull(account_1.default),
    args: {
        phone: { type: index_1.GT.NonNull(phone_1.default) },
    },
    resolve: async (parent, { phone }) => {
        if (phone instanceof Error) {
            throw phone;
        }
        const account = await _app_1.Admin.getAccountByUserPhone(phone);
        if (account instanceof Error) {
            throw account;
        }
        return account;
    },
});
exports.default = AccountDetailsByUserPhoneQuery;
//# sourceMappingURL=account-details-by-phone.js.map