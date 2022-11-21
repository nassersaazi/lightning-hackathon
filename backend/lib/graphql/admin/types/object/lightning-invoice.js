"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const ln_payment_preimage_1 = __importDefault(require("../../../types/scalar/ln-payment-preimage"));
const ln_payment_request_1 = __importDefault(require("../../../types/scalar/ln-payment-request"));
const sat_amount_1 = __importDefault(require("../../../types/scalar/sat-amount"));
const timestamp_1 = __importDefault(require("../../../types/scalar/timestamp"));
const LightningInvoice = index_1.GT.Object({
    name: "LightningInvoice",
    fields: () => ({
        createdAt: { type: index_1.GT.NonNull(timestamp_1.default) },
        confirmedAt: { type: timestamp_1.default },
        description: {
            type: index_1.GT.NonNull(index_1.GT.String),
            resolve: (source) => source.lnInvoice.description,
        },
        expiresAt: {
            type: timestamp_1.default,
            resolve: (source) => source.lnInvoice.expiresAt,
        },
        isSettled: { type: index_1.GT.NonNull(index_1.GT.Boolean) },
        received: {
            type: index_1.GT.NonNull(sat_amount_1.default),
            resolve: (source) => source.roundedDownReceived,
        },
        request: {
            type: ln_payment_request_1.default,
            resolve: (source) => source.lnInvoice.paymentRequest,
        },
        secretPreImage: { type: index_1.GT.NonNull(ln_payment_preimage_1.default) },
    }),
});
exports.default = LightningInvoice;
//# sourceMappingURL=lightning-invoice.js.map