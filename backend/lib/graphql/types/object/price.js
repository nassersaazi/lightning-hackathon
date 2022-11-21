"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const safe_int_1 = __importDefault(require("../scalar/safe-int"));
const exchange_currency_unit_1 = __importDefault(require("../scalar/exchange-currency-unit"));
const Price = index_1.GT.Object({
    name: "Price",
    description: "Price amount expressed in base/offset. To calculate, use: `base / 10^offset`",
    fields: () => ({
        base: { type: index_1.GT.NonNull(safe_int_1.default) },
        offset: { type: index_1.GT.NonNull(index_1.GT.Int) },
        currencyUnit: { type: index_1.GT.NonNull(exchange_currency_unit_1.default) },
        formattedAmount: { type: index_1.GT.NonNull(index_1.GT.String) },
    }),
});
exports.default = Price;
//# sourceMappingURL=price.js.map