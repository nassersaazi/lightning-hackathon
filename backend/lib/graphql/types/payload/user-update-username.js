"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const graphql_user_1 = __importDefault(require("../object/graphql-user"));
const UserUpdateUsernamePayload = index_1.GT.Object({
    name: "UserUpdateUsernamePayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        user: {
            type: graphql_user_1.default,
        },
    }),
});
exports.default = UserUpdateUsernamePayload;
//# sourceMappingURL=user-update-username.js.map