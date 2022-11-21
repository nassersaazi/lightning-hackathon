"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const cent_amount_1 = __importDefault(require("../scalar/cent-amount"));
const CentAmountPayload = index_1.GT.Object({
    name: "CentAmountPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        amount: {
            type: cent_amount_1.default,
        },
    }),
});
exports.default = CentAmountPayload;
//# sourceMappingURL=cent-amount.js.map