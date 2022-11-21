"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const price_1 = __importDefault(require("../object/price"));
const PricePayload = index_1.GT.Object({
    name: "PricePayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        price: {
            type: price_1.default,
        },
    }),
});
exports.default = PricePayload;
//# sourceMappingURL=price.js.map