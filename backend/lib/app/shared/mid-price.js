"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMidPriceRatio = exports.getCurrentPriceInCentsPerSat = exports.btcFromUsdMidPriceFn = exports.usdFromBtcMidPriceFn = void 0;
const prices_1 = require("../prices");
const _config_1 = require("../../config/index");
const fiat_1 = require("../../domain/fiat");
const payments_1 = require("../../domain/payments");
const shared_1 = require("../../domain/shared");
const dealer_price_1 = require("../../services/dealer-price");
const tracing_1 = require("../../services/tracing");
const usdHedgeEnabled = (0, _config_1.getDealerConfig)().usd.hedgingEnabled;
const dealer = (0, dealer_price_1.NewDealerPriceService)();
const usdFromBtcMidPriceFn = async (amount) => (0, tracing_1.asyncRunInSpan)("app.payments.usdFromBtcMidPriceFn", {
    attributes: {
        [tracing_1.SemanticAttributes.CODE_FUNCTION]: "usdFromBtcMidPriceFn",
        [tracing_1.SemanticAttributes.CODE_NAMESPACE]: "app.payments",
    },
}, async () => {
    const midPriceRatio = await (0, exports.getMidPriceRatio)(usdHedgeEnabled);
    if (midPriceRatio instanceof Error)
        return midPriceRatio;
    const usdPaymentAmount = midPriceRatio.convertFromBtc(amount);
    (0, tracing_1.addAttributesToCurrentSpan)({
        "usdFromBtcMidPriceFn.midPriceRatio": midPriceRatio.usdPerSat(),
        "usdFromBtcMidPriceFn.incoming.amount": Number(amount.amount),
        "usdFromBtcMidPriceFn.incoming.unit": amount.currency === shared_1.WalletCurrency.Btc
            ? shared_1.ExchangeCurrencyUnit.Btc
            : shared_1.ExchangeCurrencyUnit.Usd,
        "usdFromBtcMidPriceFn.outgoing.amount": Number(usdPaymentAmount.amount),
        "usdFromBtcMidPriceFn.outgoing.unit": usdPaymentAmount.currency === shared_1.WalletCurrency.Usd
            ? shared_1.ExchangeCurrencyUnit.Usd
            : shared_1.ExchangeCurrencyUnit.Btc,
    });
    return usdPaymentAmount;
});
exports.usdFromBtcMidPriceFn = usdFromBtcMidPriceFn;
const btcFromUsdMidPriceFn = async (amount) => (0, tracing_1.asyncRunInSpan)("app.payments.btcFromUsdMidPriceFn", {
    attributes: {
        [tracing_1.SemanticAttributes.CODE_FUNCTION]: "btcFromUsdMidPriceFn",
        [tracing_1.SemanticAttributes.CODE_NAMESPACE]: "app.payments",
    },
}, async () => {
    const midPriceRatio = await (0, exports.getMidPriceRatio)(usdHedgeEnabled);
    if (midPriceRatio instanceof Error)
        return midPriceRatio;
    const btcPaymentAmount = midPriceRatio.convertFromUsd(amount);
    (0, tracing_1.addAttributesToCurrentSpan)({
        "btcFromUsdMidPriceFn.midPriceRatio": midPriceRatio.usdPerSat(),
        "btcFromUsdMidPriceFn.incoming.amount": Number(amount.amount),
        "btcFromUsdMidPriceFn.incoming.unit": amount.currency === shared_1.WalletCurrency.Usd
            ? shared_1.ExchangeCurrencyUnit.Usd
            : shared_1.ExchangeCurrencyUnit.Btc,
        "btcFromUsdMidPriceFn.outgoing.amount": Number(btcPaymentAmount.amount),
        "btcFromUsdMidPriceFn.outgoing.unit": btcPaymentAmount.currency === shared_1.WalletCurrency.Btc
            ? shared_1.ExchangeCurrencyUnit.Btc
            : shared_1.ExchangeCurrencyUnit.Usd,
    });
    return btcPaymentAmount;
});
exports.btcFromUsdMidPriceFn = btcFromUsdMidPriceFn;
const getCurrentPriceInCentsPerSat = async () => {
    const price = await (0, prices_1.getCurrentPrice)();
    if (price instanceof Error)
        return price;
    return (0, payments_1.toPriceRatio)(price * fiat_1.CENTS_PER_USD);
};
exports.getCurrentPriceInCentsPerSat = getCurrentPriceInCentsPerSat;
const getMidPriceRatio = async (usdHedgeEnabled) => {
    if (usdHedgeEnabled) {
        const priceRatio = await dealer.getCentsPerSatsExchangeMidRate();
        if (priceRatio instanceof Error) {
            (0, tracing_1.recordExceptionInCurrentSpan)({
                error: priceRatio,
                level: shared_1.ErrorLevel.Critical,
            });
            return (0, exports.getCurrentPriceInCentsPerSat)();
        }
        return priceRatio;
    }
    return (0, exports.getCurrentPriceInCentsPerSat)();
};
exports.getMidPriceRatio = getMidPriceRatio;
//# sourceMappingURL=mid-price.js.map