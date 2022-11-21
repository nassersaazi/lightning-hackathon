"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const ln_pubkey_1 = __importDefault(require("../../../types/scalar/ln-pubkey"));
const timestamp_1 = __importDefault(require("../../../types/scalar/timestamp"));
const sat_amount_1 = __importDefault(require("../../../types/scalar/sat-amount"));
const ln_payment_status_1 = __importDefault(require("../../../types/scalar/ln-payment-status"));
const ln_payment_request_1 = __importDefault(require("../../../types/scalar/ln-payment-request"));
const ln_payment_preimage_1 = __importDefault(require("../../../types/scalar/ln-payment-preimage"));
const LightningPayment = index_1.GT.Object({
    name: "LightningPayment",
    fields: () => ({
        status: { type: ln_payment_status_1.default },
        roundedUpFee: {
            type: sat_amount_1.default,
            resolve: (source) => source.confirmedDetails?.roundedUpFee,
        },
        createdAt: { type: timestamp_1.default },
        confirmedAt: {
            type: timestamp_1.default,
            resolve: (source) => source.confirmedDetails?.confirmedAt,
        },
        amount: {
            type: sat_amount_1.default,
            resolve: (source) => source.roundedUpAmount,
        },
        revealedPreImage: {
            type: ln_payment_preimage_1.default,
            resolve: (source) => source.confirmedDetails?.revealedPreImage,
        },
        request: {
            type: ln_payment_request_1.default,
            resolve: (source) => source.paymentRequest,
        },
        destination: {
            type: ln_pubkey_1.default,
            resolve: (source) => source.confirmedDetails?.destination,
        },
    }),
});
exports.default = LightningPayment;
//# sourceMappingURL=lightning-payment.js.map