"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const account_contact_1 = __importDefault(require("../object/account-contact"));
const AccountContactUpdateAliasPayload = index_1.GT.Object({
    name: "UserContactUpdateAliasPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        contact: {
            type: account_contact_1.default,
        },
    }),
});
exports.default = AccountContactUpdateAliasPayload;
//# sourceMappingURL=user-contact-update-alias.js.map