"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeBigInt = void 0;
const errors_1 = require("./errors");
const safeBigInt = (num) => {
    try {
        return BigInt(num);
    }
    catch (err) {
        if (err instanceof RangeError) {
            return new errors_1.BigIntFloatConversionError(`${num}`);
        }
        return new errors_1.UnknownBigIntConversionError(err);
    }
};
exports.safeBigInt = safeBigInt;
//# sourceMappingURL=safe.js.map