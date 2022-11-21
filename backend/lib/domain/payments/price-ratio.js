"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPriceRatio = exports.PriceRatio = void 0;
const _config_1 = require("../../config/index");
const shared_1 = require("../shared");
const errors_1 = require("./errors");
const calc = (0, shared_1.AmountCalculator)();
const PriceRatio = ({ usd, btc, }) => {
    if (usd.amount === 0n || btc.amount === 0n) {
        return new errors_1.InvalidZeroAmountPriceRatioInputError();
    }
    const convertFromUsd = (convert) => {
        const currency = shared_1.WalletCurrency.Btc;
        if (convert.amount === 0n) {
            return { amount: 0n, currency };
        }
        const amount = calc.divRound({ amount: convert.amount * btc.amount, currency }, usd.amount);
        return { amount: amount.amount || 1n, currency };
    };
    const convertFromBtc = (convert) => {
        const currency = shared_1.WalletCurrency.Usd;
        if (convert.amount === 0n) {
            return { amount: 0n, currency };
        }
        const amount = calc.divRound({ amount: convert.amount * usd.amount, currency }, btc.amount);
        return { amount: amount.amount || 1n, currency };
    };
    const convertFromBtcToFloor = (convert) => calc.divFloor({ amount: convert.amount * usd.amount, currency: shared_1.WalletCurrency.Usd }, btc.amount);
    const convertFromBtcToCeil = (convert) => calc.divCeil({ amount: convert.amount * usd.amount, currency: shared_1.WalletCurrency.Usd }, btc.amount);
    return {
        convertFromUsd,
        convertFromBtc,
        convertFromBtcToFloor,
        convertFromBtcToCeil,
        usdPerSat: () => (Number(usd.amount) / Number(btc.amount)),
    };
};
exports.PriceRatio = PriceRatio;
const toPriceRatio = (ratio) => {
    const precision = _config_1.RATIO_PRECISION;
    const usd = {
        amount: BigInt(Math.floor(ratio * precision)),
        currency: shared_1.WalletCurrency.Usd,
    };
    const btc = {
        amount: BigInt(precision),
        currency: shared_1.WalletCurrency.Btc,
    };
    return (0, exports.PriceRatio)({ usd, btc });
};
exports.toPriceRatio = toPriceRatio;
//# sourceMappingURL=price-ratio.js.map