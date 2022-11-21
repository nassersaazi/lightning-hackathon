"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceAmountFromNumber = exports.paymentAmountFromNumber = exports.UsdPaymentAmount = exports.BtcPaymentAmount = exports.UsdWalletDescriptor = exports.BtcWalletDescriptor = exports.MAX_CENTS = exports.MAX_SATS = exports.ZERO_BANK_FEE = exports.ZERO_CENTS = exports.ZERO_SATS = exports.ExchangeCurrencyUnit = exports.WalletCurrency = void 0;
const safe_1 = require("./safe");
// TODO: think how to differentiate physical from synthetic USD
exports.WalletCurrency = {
    Usd: "USD",
    Btc: "BTC",
};
exports.ExchangeCurrencyUnit = {
    Usd: "USDCENT",
    Btc: "BTCSAT",
};
exports.ZERO_SATS = {
    currency: exports.WalletCurrency.Btc,
    amount: 0n,
};
exports.ZERO_CENTS = {
    currency: exports.WalletCurrency.Usd,
    amount: 0n,
};
exports.ZERO_BANK_FEE = {
    usdBankFee: exports.ZERO_CENTS,
    btcBankFee: exports.ZERO_SATS,
};
// 100_000 BTC is the max amount you can make a hodl invoice for in lnd
exports.MAX_SATS = {
    currency: exports.WalletCurrency.Btc,
    amount: 10000000000000n,
};
// Assumes optimistic price under sat-cent parity
exports.MAX_CENTS = {
    currency: exports.WalletCurrency.Usd,
    amount: 10000000000000n,
};
const BtcWalletDescriptor = (walletId) => {
    return {
        id: walletId,
        currency: exports.WalletCurrency.Btc,
    };
};
exports.BtcWalletDescriptor = BtcWalletDescriptor;
const UsdWalletDescriptor = (walletId) => {
    return {
        id: walletId,
        currency: exports.WalletCurrency.Usd,
    };
};
exports.UsdWalletDescriptor = UsdWalletDescriptor;
const BtcPaymentAmount = (sats) => {
    return {
        currency: exports.WalletCurrency.Btc,
        amount: sats,
    };
};
exports.BtcPaymentAmount = BtcPaymentAmount;
const UsdPaymentAmount = (cents) => {
    return {
        currency: exports.WalletCurrency.Usd,
        amount: cents,
    };
};
exports.UsdPaymentAmount = UsdPaymentAmount;
const paymentAmountFromNumber = ({ amount, currency, }) => {
    const safeAmount = (0, safe_1.safeBigInt)(amount);
    if (safeAmount instanceof Error)
        return safeAmount;
    return {
        amount: safeAmount,
        currency,
    };
};
exports.paymentAmountFromNumber = paymentAmountFromNumber;
const balanceAmountFromNumber = ({ amount, currency, }) => {
    const safeAmount = (0, safe_1.safeBigInt)(amount);
    if (safeAmount instanceof Error)
        return safeAmount;
    return {
        amount: safeAmount,
        currency,
    };
};
exports.balanceAmountFromNumber = balanceAmountFromNumber;
//# sourceMappingURL=primitives.js.map