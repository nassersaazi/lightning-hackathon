"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const price_1 = __importDefault(require("../root/subscription/price"));
const ln_invoice_payment_status_1 = __importDefault(require("../root/subscription/ln-invoice-payment-status"));
const my_updates_1 = __importDefault(require("../root/subscription/my-updates"));
const tracing_1 = require("../../services/tracing");
const fields = {
    myUpdates: my_updates_1.default,
    price: price_1.default,
    lnInvoicePaymentStatus: ln_invoice_payment_status_1.default,
};
const addTracing = () => {
    for (const key in fields) {
        // @ts-ignore-next-line no-implicit-any error
        const original = fields[key].resolve;
        /* eslint @typescript-eslint/ban-ts-comment: "off" */
        // @ts-ignore-next-line no-implicit-any error
        fields[key].resolve = (source, args, context, info) => {
            const { ip, domainAccount } = context;
            (0, tracing_1.addAttributesToCurrentSpan)({
                [tracing_1.SemanticAttributes.ENDUSER_ID]: domainAccount?.id,
                [tracing_1.ACCOUNT_USERNAME]: domainAccount?.username,
                [tracing_1.SemanticAttributes.HTTP_CLIENT_IP]: ip,
            });
            return original(source, args, context, info);
        };
    }
    return fields;
};
const SubscriptionType = index_1.GT.Object({
    name: "Subscription",
    fields: addTracing(),
});
exports.default = SubscriptionType;
//# sourceMappingURL=subscriptions.js.map