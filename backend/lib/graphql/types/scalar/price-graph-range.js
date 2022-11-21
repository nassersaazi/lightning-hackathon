"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceRangeValues = void 0;
const index_1 = require("../../index");
exports.priceRangeValues = [
    "ONE_DAY",
    "ONE_WEEK",
    "ONE_MONTH",
    "ONE_YEAR",
    "FIVE_YEARS",
];
const PriceGraphRange = index_1.GT.Enum({
    name: "PriceGraphRange",
    description: "The range for the X axis in the BTC price graph",
    values: exports.priceRangeValues.reduce((acc, curr) => {
        acc[curr] = {};
        return acc;
    }, {}),
});
exports.default = PriceGraphRange;
//# sourceMappingURL=price-graph-range.js.map