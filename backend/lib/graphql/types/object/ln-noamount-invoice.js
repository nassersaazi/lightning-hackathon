"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const ln_payment_request_1 = __importDefault(require("../scalar/ln-payment-request"));
const payment_hash_1 = __importDefault(require("../scalar/payment-hash"));
const ln_payment_secret_1 = __importDefault(require("../scalar/ln-payment-secret"));
const LnNoAmountInvoice = index_1.GT.Object({
    name: "LnNoAmountInvoice",
    fields: () => ({
        paymentRequest: {
            type: index_1.GT.NonNull(ln_payment_request_1.default),
        },
        paymentHash: {
            type: index_1.GT.NonNull(payment_hash_1.default),
        },
        paymentSecret: {
            type: index_1.GT.NonNull(ln_payment_secret_1.default),
        },
    }),
});
exports.default = LnNoAmountInvoice;
//# sourceMappingURL=ln-noamount-invoice.js.map