"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const graphql_user_1 = __importDefault(require("../object/graphql-user"));
const error_1 = __importDefault(require("../abstract/error"));
const UserUpdateLanguagePayload = index_1.GT.Object({
    name: "UserUpdateLanguagePayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        user: {
            type: graphql_user_1.default,
        },
    }),
});
exports.default = UserUpdateLanguagePayload;
//# sourceMappingURL=user-update-language.js.map