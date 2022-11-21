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
exports.checkedToUsdPaymentAmount = exports.checkedToBtcPaymentAmount = void 0;
__exportStar(require("./errors"), exports);
__exportStar(require("./payment-flow"), exports);
__exportStar(require("./payment-flow-builder"), exports);
__exportStar(require("./price-ratio"), exports);
__exportStar(require("./ln-fees"), exports);
const shared_1 = require("../shared");
const errors_1 = require("./errors");
const checkedToBtcPaymentAmount = (amount) => {
    if (amount === null) {
        return new errors_1.InvalidBtcPaymentAmountError();
    }
    if (amount > shared_1.MAX_SATS.amount) {
        return new shared_1.BtcAmountTooLargeError();
    }
    if (Math.floor(amount) != amount) {
        return new errors_1.InvalidBtcPaymentAmountError();
    }
    if (!(amount && amount > 0))
        return new errors_1.InvalidBtcPaymentAmountError();
    return (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Btc });
};
exports.checkedToBtcPaymentAmount = checkedToBtcPaymentAmount;
const checkedToUsdPaymentAmount = (amount) => {
    if (amount === null) {
        return new errors_1.InvalidUsdPaymentAmountError();
    }
    if (amount > shared_1.MAX_CENTS.amount) {
        return new shared_1.UsdAmountTooLargeError();
    }
    if (Math.floor(amount) != amount) {
        return new errors_1.InvalidUsdPaymentAmountError();
    }
    if (!(amount && amount > 0))
        return new errors_1.InvalidUsdPaymentAmountError();
    return (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Usd });
};
exports.checkedToUsdPaymentAmount = checkedToUsdPaymentAmount;
//# sourceMappingURL=index.js.map