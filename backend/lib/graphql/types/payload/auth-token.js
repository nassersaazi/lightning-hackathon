"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const auth_token_1 = __importDefault(require("../scalar/auth-token"));
const error_1 = __importDefault(require("../abstract/error"));
const AuthTokenPayload = index_1.GT.Object({
    name: "AuthTokenPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        authToken: {
            type: auth_token_1.default,
        },
    }),
});
exports.default = AuthTokenPayload;
//# sourceMappingURL=auth-token.js.map