"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_INTERFACE_TYPES = void 0;
// import BusinessAccount from "./object/business-account"
const btc_wallet_1 = __importDefault(require("./object/btc-wallet"));
const consumer_account_1 = __importDefault(require("./object/consumer-account"));
const usd_wallet_1 = __importDefault(require("./object/usd-wallet"));
const graphql_application_error_1 = __importDefault(require("./object/graphql-application-error"));
// The following types are not directly included
// in the GraphQL schema. They only implement interfaces.
// They need to be included via GraphQLSchema.types config
exports.ALL_INTERFACE_TYPES = [
    graphql_application_error_1.default,
    consumer_account_1.default,
    // BusinessAccount,
    btc_wallet_1.default,
    usd_wallet_1.default,
];
//# sourceMappingURL=index.js.map