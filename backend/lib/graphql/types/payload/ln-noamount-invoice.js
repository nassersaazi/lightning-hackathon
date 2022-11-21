"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const ln_noamount_invoice_1 = __importDefault(require("../object/ln-noamount-invoice"));
const LnNoAmountInvoicePayload = index_1.GT.Object({
    name: "LnNoAmountInvoicePayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        invoice: {
            type: ln_noamount_invoice_1.default,
        },
    }),
});
exports.default = LnNoAmountInvoicePayload;
//# sourceMappingURL=ln-noamount-invoice.js.map