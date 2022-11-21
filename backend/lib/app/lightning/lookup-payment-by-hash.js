"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupPaymentByHash = void 0;
const lnd_1 = require("../../services/lnd");
const lookupPaymentByHash = async (paymentHash) => {
    const lndService = (0, lnd_1.LndService)();
    if (lndService instanceof Error)
        return lndService;
    return lndService.lookupPayment({ paymentHash });
};
exports.lookupPaymentByHash = lookupPaymentByHash;
//# sourceMappingURL=lookup-payment-by-hash.js.map