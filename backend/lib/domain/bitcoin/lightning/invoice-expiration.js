"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceExpirationForCurrency = exports.defaultTimeToExpiryInSeconds = void 0;
const SECS_PER_5_MINS = (60 * 5);
const SECS_PER_DAY = (60 * 60 * 24);
exports.defaultTimeToExpiryInSeconds = SECS_PER_5_MINS;
const DEFAULT_EXPIRATIONS = {
    BTC: { delay: SECS_PER_DAY },
    USD: { delay: exports.defaultTimeToExpiryInSeconds },
};
const invoiceExpirationForCurrency = (currency, now) => {
    const { delay } = DEFAULT_EXPIRATIONS[currency];
    const expirationTimestamp = now.getTime() + delay * 1000;
    return new Date(expirationTimestamp);
};
exports.invoiceExpirationForCurrency = invoiceExpirationForCurrency;
//# sourceMappingURL=invoice-expiration.js.map