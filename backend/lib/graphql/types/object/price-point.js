"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const timestamp_1 = __importDefault(require("../scalar/timestamp"));
const price_1 = __importDefault(require("./price"));
const PricePoint = index_1.GT.Object({
    name: "PricePoint",
    fields: () => ({
        timestamp: {
            type: index_1.GT.NonNull(timestamp_1.default),
            description: "Unix timestamp (number of seconds elapsed since January 1, 1970 00:00:00 UTC)",
        },
        price: { type: index_1.GT.NonNull(price_1.default) },
    }),
});
exports.default = PricePoint;
//# sourceMappingURL=price-point.js.map