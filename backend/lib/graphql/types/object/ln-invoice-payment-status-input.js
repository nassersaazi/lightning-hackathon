"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const ln_payment_request_1 = __importDefault(require("../scalar/ln-payment-request"));
const LnInvoicePaymentStatusInput = index_1.GT.Input({
    name: "LnInvoicePaymentStatusInput",
    fields: () => ({
        paymentRequest: { type: index_1.GT.NonNull(ln_payment_request_1.default) },
    }),
});
exports.default = LnInvoicePaymentStatusInput;
//# sourceMappingURL=ln-invoice-payment-status-input.js.map