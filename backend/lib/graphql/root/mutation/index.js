"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePaymentAmount = void 0;
const shared_1 = require("../../../domain/shared");
const normalizePaymentAmount = (paymentAmount) => ({
    amount: Number(paymentAmount.amount),
    currencyUnit: paymentAmount.currency === shared_1.WalletCurrency.Usd
        ? shared_1.ExchangeCurrencyUnit.Usd
        : shared_1.ExchangeCurrencyUnit.Btc,
});
exports.normalizePaymentAmount = normalizePaymentAmount;
//# sourceMappingURL=index.js.map