"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const price_point_1 = __importDefault(require("../../types/object/price-point"));
const price_graph_range_1 = __importDefault(require("../../types/scalar/price-graph-range"));
const error_1 = require("../../error");
const price_1 = require("../../../domain/price");
const _config_1 = require("../../../config/index");
const _app_1 = require("../../../app/index");
const bitcoin_1 = require("../../../domain/bitcoin");
const error_map_1 = require("../../error-map");
const parseRange = (range) => {
    switch (range) {
        case "ONE_DAY":
            return price_1.PriceRange.OneDay;
        case "ONE_WEEK":
            return price_1.PriceRange.OneWeek;
        case "ONE_MONTH":
            return price_1.PriceRange.OneMonth;
        case "ONE_YEAR":
            return price_1.PriceRange.OneYear;
        case "FIVE_YEARS":
            return price_1.PriceRange.FiveYears;
        default:
            return new error_1.InputValidationError({ message: "Invalid value for 'range'." });
    }
};
const parseInterval = (range) => {
    switch (range) {
        case "ONE_DAY":
            return price_1.PriceInterval.OneHour;
        case "ONE_WEEK":
            return price_1.PriceInterval.FourHours;
        case "ONE_MONTH":
            return price_1.PriceInterval.OneDay;
        case "ONE_YEAR":
            return price_1.PriceInterval.OneWeek;
        case "FIVE_YEARS":
            return price_1.PriceInterval.OneMonth;
        default:
            return new error_1.InputValidationError({ message: "Invalid value for 'range'." });
    }
};
const BtcPriceListQuery = index_1.GT.Field({
    type: index_1.GT.List(price_point_1.default),
    args: {
        range: {
            type: index_1.GT.NonNull(price_graph_range_1.default),
        },
    },
    resolve: async (_, args) => {
        const range = parseRange(args.range);
        const interval = parseInterval(args.range);
        if (range instanceof Error)
            throw range;
        if (interval instanceof Error)
            throw interval;
        const hourlyPrices = await _app_1.Prices.getPriceHistory({ range, interval });
        if (hourlyPrices instanceof Error)
            throw (0, error_map_1.mapError)(hourlyPrices);
        const prices = hourlyPrices.map(({ date, price }) => {
            const btcPriceInCents = price * 100 * bitcoin_1.SATS_PER_BTC;
            return {
                timestamp: Math.floor(date.getTime() / 1000),
                price: {
                    formattedAmount: btcPriceInCents.toString(),
                    base: Math.round(btcPriceInCents * 10 ** _config_1.BTC_PRICE_PRECISION_OFFSET),
                    offset: _config_1.BTC_PRICE_PRECISION_OFFSET,
                    currencyUnit: "USDCENT",
                },
            };
        });
        // Add the current price as the last item in the array
        // This is used by the mobile app to convert prices
        const currentPrice = await _app_1.Prices.getCurrentPrice();
        if (!(currentPrice instanceof Error)) {
            const currentBtcPriceInCents = currentPrice * 100 * bitcoin_1.SATS_PER_BTC;
            prices.push({
                timestamp: Math.round(new Date().getTime() / 1000),
                price: {
                    formattedAmount: currentBtcPriceInCents.toString(),
                    base: Math.round(currentBtcPriceInCents * 10 ** _config_1.BTC_PRICE_PRECISION_OFFSET),
                    offset: _config_1.BTC_PRICE_PRECISION_OFFSET,
                    currencyUnit: "USDCENT",
                },
            });
        }
        return prices;
    },
});
exports.default = BtcPriceListQuery;
//# sourceMappingURL=btc-price-list.js.map