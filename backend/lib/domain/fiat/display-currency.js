"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewDisplayCurrencyConverter = exports.DisplayCurrencyConverter = exports.toDisplayCurrencyBaseAmount = exports.CENTS_PER_USD = void 0;
exports.CENTS_PER_USD = 100;
const toDisplayCurrencyBaseAmount = (amount) => amount;
exports.toDisplayCurrencyBaseAmount = toDisplayCurrencyBaseAmount;
const DisplayCurrencyConverter = (price) => ({
    fromSats: (amount) => {
        return (Number(amount) * price);
    },
    fromCents: (amount) => {
        // FIXME: implement where DisplayCurrency is not USD
        return amount;
    },
    // TODO: this method should eventually be moved to the dealer
    // the currency assumption is displayCurrency is USD
    fromSatsToCents: (amount) => {
        return Math.floor(Number(amount) * (price * exports.CENTS_PER_USD));
    },
    fromCentsToSats: (amount) => {
        return Math.floor(Number(amount) / (price * exports.CENTS_PER_USD));
    },
});
exports.DisplayCurrencyConverter = DisplayCurrencyConverter;
const NewDisplayCurrencyConverter = (displayCurrencyPrice) => {
    return {
        fromBtcAmount: (btc) => (Number(btc.amount) * displayCurrencyPrice),
        fromUsdAmount: (usd) => Number(usd.amount),
    };
};
exports.NewDisplayCurrencyConverter = NewDisplayCurrencyConverter;
//# sourceMappingURL=display-currency.js.map