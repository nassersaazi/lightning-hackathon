"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const invoice_payment_status_1 = __importDefault(require("../scalar/invoice-payment-status"));
const LnInvoicePaymentStatusPayload = index_1.GT.Object({
    name: "LnInvoicePaymentStatusPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        status: { type: invoice_payment_status_1.default },
    }),
});
exports.default = LnInvoicePaymentStatusPayload;
//# sourceMappingURL=ln-invoice-payment-status.js.map