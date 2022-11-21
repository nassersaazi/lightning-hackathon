"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecretAndPaymentHash = exports.sha256 = exports.parseFinalHopsFromInvoice = exports.checkedToPubkey = exports.PaymentSendStatus = exports.PaymentStatus = exports.defaultTimeToExpiryInSeconds = exports.invoiceExpirationForCurrency = exports.decodeInvoice = void 0;
const crypto_1 = require("crypto");
const errors_1 = require("../../errors");
var ln_invoice_1 = require("./ln-invoice");
Object.defineProperty(exports, "decodeInvoice", { enumerable: true, get: function () { return ln_invoice_1.decodeInvoice; } });
var invoice_expiration_1 = require("./invoice-expiration");
Object.defineProperty(exports, "invoiceExpirationForCurrency", { enumerable: true, get: function () { return invoice_expiration_1.invoiceExpirationForCurrency; } });
Object.defineProperty(exports, "defaultTimeToExpiryInSeconds", { enumerable: true, get: function () { return invoice_expiration_1.defaultTimeToExpiryInSeconds; } });
__exportStar(require("./errors"), exports);
exports.PaymentStatus = {
    Settled: "settled",
    Failed: "failed",
    Pending: "pending",
};
exports.PaymentSendStatus = {
    Success: { value: "success" },
    Failure: { value: "failed" },
    Pending: { value: "pending" },
    AlreadyPaid: { value: "already_paid" },
};
const pubkeyRegex = /^[a-f0-9]{66}$/i;
const checkedToPubkey = (pubkey) => {
    if (pubkey.match(pubkeyRegex)) {
        return pubkey;
    }
    return new errors_1.InvalidPubKeyError("Pubkey conversion error");
};
exports.checkedToPubkey = checkedToPubkey;
const parseFinalHopsFromInvoice = (invoice) => {
    const pubkeys = [];
    const routes = invoice.routeHints;
    for (const route of routes) {
        const lastIdx = route.length - 1;
        const penUltIndex = route.length > 1 ? lastIdx - 1 : lastIdx;
        const lastHop = route[penUltIndex];
        pubkeys.push(lastHop.nodePubkey);
    }
    return Array.from(new Set(pubkeys));
};
exports.parseFinalHopsFromInvoice = parseFinalHopsFromInvoice;
const sha256 = (buffer) => (0, crypto_1.createHash)("sha256").update(buffer).digest("hex");
exports.sha256 = sha256;
const randomSecret = () => (0, crypto_1.randomBytes)(32);
const getSecretAndPaymentHash = () => {
    const secret = randomSecret();
    const paymentHash = (0, exports.sha256)(secret);
    return { secret: secret.toString("hex"), paymentHash };
};
exports.getSecretAndPaymentHash = getSecretAndPaymentHash;
//# sourceMappingURL=index.js.map