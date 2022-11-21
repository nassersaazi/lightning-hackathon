"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const index_1 = require("../../index");
const error_map_1 = require("../../error-map");
const ln_invoice_payment_status_1 = __importDefault(require("../../types/payload/ln-invoice-payment-status"));
const ln_invoice_payment_status_input_1 = __importDefault(require("../../types/object/ln-invoice-payment-status-input"));
const LnInvoicePaymentStatusQuery = index_1.GT.Field({
    type: index_1.GT.NonNull(ln_invoice_payment_status_1.default),
    args: {
        input: { type: index_1.GT.NonNull(ln_invoice_payment_status_input_1.default) },
    },
    resolve: async (_, args) => {
        const { paymentRequest } = args.input;
        if (paymentRequest instanceof Error)
            throw paymentRequest;
        const paymentStatusChecker = await _app_1.Lightning.PaymentStatusChecker(paymentRequest);
        if (paymentStatusChecker instanceof Error)
            throw (0, error_map_1.mapError)(paymentStatusChecker);
        const paid = await paymentStatusChecker.invoiceIsPaid();
        if (paid instanceof Error)
            throw (0, error_map_1.mapError)(paid);
        if (paid)
            return { errors: [], status: "PAID" };
        return { errors: [], status: "PENDING" };
    },
});
exports.default = LnInvoicePaymentStatusQuery;
//# sourceMappingURL=ln-invoice-payment-status.js.map