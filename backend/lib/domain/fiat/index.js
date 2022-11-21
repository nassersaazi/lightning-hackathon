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
exports.DisplayCurrency = exports.sub = exports.add = exports.OrderType = exports.checkedtoCents = exports.toCentsPerSatsRatio = exports.toCents = void 0;
const errors_1 = require("../errors");
__exportStar(require("./display-currency"), exports);
const toCents = (amount) => {
    return Number(amount);
};
exports.toCents = toCents;
const toCentsPerSatsRatio = (amount) => {
    return amount;
};
exports.toCentsPerSatsRatio = toCentsPerSatsRatio;
const checkedtoCents = (amount) => {
    if (!(amount && amount > 0))
        return new errors_1.InvalidUsdCents();
    if (!Number.isInteger(amount))
        return new errors_1.NonIntegerError(`${amount} type ${typeof amount} is not an integer`);
    return (0, exports.toCents)(amount);
};
exports.checkedtoCents = checkedtoCents;
exports.OrderType = {
    Locked: "immediate",
    Active: "quote",
};
const add = (arg0, arg1) => (arg0 + arg1);
exports.add = add;
const sub = (arg0, arg1) => {
    const result = arg0 - arg1;
    if (result < 0)
        return new errors_1.InvalidNegativeAmountError();
    return result;
};
exports.sub = sub;
exports.DisplayCurrency = {
    Usd: "USD",
    Btc: "BTC",
    Crc: "CRC",
};
//# sourceMappingURL=index.js.map