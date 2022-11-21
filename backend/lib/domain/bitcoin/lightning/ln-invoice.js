"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeInvoice = void 0;
const shared_1 = require("../../shared");
const bitcoin_1 = require("..");
const invoices_1 = require("invoices");
const errors_1 = require("./errors");
const decodeInvoice = (uncheckedBolt11EncodedInvoice) => {
    const bolt11EncodedInvoice = uncheckedBolt11EncodedInvoice.toLowerCase();
    const decodedInvoice = safeDecode(bolt11EncodedInvoice);
    if (decodedInvoice instanceof Error)
        return decodedInvoice;
    if (!decodedInvoice.payment) {
        return new errors_1.LnInvoiceMissingPaymentSecretError();
    }
    const paymentSecret = decodedInvoice.payment;
    const cltvDelta = decodedInvoice.cltv_delta
        ? decodedInvoice.cltv_delta
        : null;
    const expiresAt = new Date(decodedInvoice.expires_at);
    const isExpired = !!decodedInvoice.is_expired;
    const amount = decodedInvoice.safe_tokens
        ? (0, bitcoin_1.toSats)(decodedInvoice.safe_tokens)
        : null;
    const paymentAmount = amount
        ? (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Btc })
        : null;
    if (paymentAmount instanceof Error)
        return paymentAmount;
    let routeHints = [];
    if (decodedInvoice.routes) {
        const invoicesRoutes = decodedInvoice.routes;
        routeHints = invoicesRoutes.map((rawRoute) => rawRoute.map((route) => ({
            baseFeeMTokens: route.base_fee_mtokens,
            channel: route.channel,
            cltvDelta: route.cltv_delta,
            feeRate: route.fee_rate,
            nodePubkey: route.public_key,
        })));
    }
    return {
        amount,
        paymentAmount,
        paymentSecret,
        expiresAt,
        isExpired,
        routeHints,
        cltvDelta,
        paymentRequest: bolt11EncodedInvoice,
        description: decodedInvoice.description || "",
        paymentHash: decodedInvoice.id,
        destination: decodedInvoice.destination,
        milliSatsAmount: (0, bitcoin_1.toMilliSatsFromNumber)(amount ? amount * 1000 : 0),
        features: (decodedInvoice.features || []),
    };
};
exports.decodeInvoice = decodeInvoice;
const safeDecode = (bolt11EncodedInvoice) => {
    try {
        return (0, invoices_1.parsePaymentRequest)({ request: bolt11EncodedInvoice });
    }
    catch (err) {
        switch (true) {
            case err.message.includes("Invalid checksum"):
                return new errors_1.InvalidChecksumForLnInvoiceError();
            default:
                return new errors_1.UnknownLnInvoiceDecodeError(err);
        }
    }
};
//# sourceMappingURL=ln-invoice.js.map