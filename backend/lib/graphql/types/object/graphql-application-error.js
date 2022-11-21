"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const GraphQLApplicationError = index_1.GT.Object({
    name: "GraphQLApplicationError",
    interfaces: () => [error_1.default],
    isTypeOf: () => true,
    fields: () => ({
        message: {
            type: index_1.GT.NonNull(index_1.GT.String),
        },
        path: {
            type: index_1.GT.List(index_1.GT.String),
        },
        code: {
            type: index_1.GT.String,
        },
    }),
});
exports.default = GraphQLApplicationError;
//# sourceMappingURL=graphql-application-error.js.map