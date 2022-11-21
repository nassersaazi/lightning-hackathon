"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const error_1 = __importDefault(require("../../../types/abstract/error"));
const account_1 = __importDefault(require("../object/account"));
const AccountDetailPayload = index_1.GT.Object({
    name: "AccountDetailPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        accountDetails: {
            type: account_1.default,
        },
    }),
});
exports.default = AccountDetailPayload;
//# sourceMappingURL=account-detail.js.map