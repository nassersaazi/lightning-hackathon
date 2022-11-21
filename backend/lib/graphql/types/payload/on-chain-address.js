"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const on_chain_address_1 = __importDefault(require("../scalar/on-chain-address"));
const OnChainAddressPayload = index_1.GT.Object({
    name: "OnChainAddressPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        address: {
            type: on_chain_address_1.default,
        },
    }),
});
exports.default = OnChainAddressPayload;
//# sourceMappingURL=on-chain-address.js.map