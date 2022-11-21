"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const _app_1 = require("../../../../app/index");
const payment_hash_1 = __importDefault(require("../../../types/scalar/payment-hash"));
const lightning_payment_1 = __importDefault(require("../../types/object/lightning-payment"));
const mongoose_1 = require("../../../../services/mongoose");
const LightningPaymentQuery = index_1.GT.Field({
    type: index_1.GT.NonNull(lightning_payment_1.default),
    args: {
        hash: { type: index_1.GT.NonNull(payment_hash_1.default) },
    },
    resolve: async (_, { hash }) => {
        if (hash instanceof Error)
            throw hash;
        const lightningPayment = await (0, mongoose_1.LnPaymentsRepository)().findByPaymentHash(hash);
        if (lightningPayment instanceof Error || !lightningPayment.isCompleteRecord) {
            const lightningPaymentFromLnd = await _app_1.Lightning.lookupPaymentByHash(hash);
            if (lightningPaymentFromLnd instanceof Error)
                throw lightningPaymentFromLnd;
            const paymentRequest = !(lightningPayment instanceof Error)
                ? lightningPayment.paymentRequest
                : "paymentRequest" in lightningPaymentFromLnd
                    ? lightningPaymentFromLnd.paymentRequest
                    : undefined;
            return {
                ...lightningPaymentFromLnd,
                paymentRequest,
            };
        }
        return lightningPayment;
    },
});
exports.default = LightningPaymentQuery;
//# sourceMappingURL=lightning-payment.js.map