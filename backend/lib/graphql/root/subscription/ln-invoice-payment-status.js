"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const pubsub_1 = require("../../../domain/pubsub");
const pubsub_2 = require("../../../services/pubsub");
const logger_1 = require("../../../services/logger");
const index_1 = require("../../index");
const ln_invoice_payment_status_1 = __importDefault(require("../../types/payload/ln-invoice-payment-status"));
const ln_invoice_payment_status_input_1 = __importDefault(require("../../types/object/ln-invoice-payment-status-input"));
const error_1 = require("../../error");
const pubsub = (0, pubsub_2.PubSubService)();
const LnInvoicePaymentStatusSubscription = {
    type: index_1.GT.NonNull(ln_invoice_payment_status_1.default),
    args: {
        input: { type: index_1.GT.NonNull(ln_invoice_payment_status_input_1.default) },
    },
    resolve: (source) => {
        if (source === undefined) {
            throw new error_1.UnknownClientError({
                message: "Got 'undefined' payload. Check url used to ensure right websocket endpoint was used for subscription.",
                logger: logger_1.baseLogger,
            });
        }
        if (source.errors) {
            return { errors: source.errors };
        }
        return {
            errors: [],
            status: source.status,
        };
    },
    subscribe: async (_source, args) => {
        const { paymentRequest } = args.input;
        if (paymentRequest instanceof Error)
            throw paymentRequest;
        const paymentStatusChecker = await _app_1.Lightning.PaymentStatusChecker(paymentRequest);
        if (paymentStatusChecker instanceof Error) {
            const lnPaymentStatusTrigger = (0, pubsub_1.customPubSubTrigger)({
                event: pubsub_1.PubSubDefaultTriggers.LnPaymentStatus,
                suffix: paymentRequest,
            });
            pubsub.publishImmediate({
                trigger: lnPaymentStatusTrigger,
                payload: { errors: [{ message: paymentStatusChecker.message }] },
            });
            return pubsub.createAsyncIterator({ trigger: lnPaymentStatusTrigger });
        }
        const trigger = (0, pubsub_1.customPubSubTrigger)({
            event: pubsub_1.PubSubDefaultTriggers.LnPaymentStatus,
            suffix: paymentStatusChecker.paymentHash,
        });
        const paid = await paymentStatusChecker.invoiceIsPaid();
        if (paid instanceof Error) {
            pubsub.publishImmediate({
                trigger,
                payload: { errors: [{ message: paid.message }] },
            });
        }
        if (paid) {
            pubsub.publishImmediate({ trigger, payload: { status: "PAID" } });
        }
        return pubsub.createAsyncIterator({ trigger });
    },
};
exports.default = LnInvoicePaymentStatusSubscription;
//# sourceMappingURL=ln-invoice-payment-status.js.map