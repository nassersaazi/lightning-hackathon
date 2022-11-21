"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const _app_1 = require("../../../app/index");
const price_1 = __importDefault(require("../../types/object/price"));
const _config_1 = require("../../../config/index");
const BtcPriceQuery = index_1.GT.Field({
    type: price_1.default,
    resolve: async () => {
        const satUsdPrice = await _app_1.Prices.getCurrentPrice();
        if (satUsdPrice instanceof Error) {
            throw satUsdPrice;
        }
        const price = 100 * satUsdPrice;
        return {
            formattedAmount: price.toString(),
            base: Math.round(price * 10 ** _config_1.SAT_PRICE_PRECISION_OFFSET),
            offset: _config_1.SAT_PRICE_PRECISION_OFFSET,
            currencyUnit: "USDCENT",
        };
    },
});
exports.default = BtcPriceQuery;
//# sourceMappingURL=btc-price.js.map