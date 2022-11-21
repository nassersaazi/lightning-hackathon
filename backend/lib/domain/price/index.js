"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceRange = exports.PriceInterval = void 0;
__exportStar(require("./errors"), exports);
const oneHourMs = 1000 * 60 * 60;
const oneDayMs = oneHourMs * 24;
exports.PriceInterval = {
    OneHour: oneHourMs,
    FourHours: oneHourMs * 4,
    OneDay: oneDayMs,
    OneWeek: oneDayMs * 7,
    OneMonth: oneDayMs * 30,
};
exports.PriceRange = {
    OneDay: "OneDay",
    OneWeek: "OneWeek",
    OneMonth: "OneMonth",
    OneYear: "OneYear",
    FiveYears: "FiveYears",
};
//# sourceMappingURL=index.js.map