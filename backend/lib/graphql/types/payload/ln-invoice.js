"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const ln_invoice_1 = __importDefault(require("../object/ln-invoice"));
const LnInvoicePayload = index_1.GT.Object({
    name: "LnInvoicePayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        invoice: {
            type: ln_invoice_1.default,
        },
    }),
});
exports.default = LnInvoicePayload;
//# sourceMappingURL=ln-invoice.js.map