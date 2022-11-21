"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../../error");
const index_1 = require("../../index");
const logger_1 = require("../../../services/logger");
const MAX_INT = Number.MAX_SAFE_INTEGER;
const MIN_INT = Number.MIN_SAFE_INTEGER;
const SafeInt = index_1.GT.Scalar({
    name: "SafeInt",
    description: "Non-fractional signed whole numeric value between -(2^53) + 1 and 2^53 - 1",
    serialize: coerceSafeInt,
    parseValue: coerceSafeInt,
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.INT) {
            const num = parseInt(ast.value, 10);
            if (num <= MAX_INT && num >= MIN_INT) {
                return num;
            }
        }
        return null;
    },
});
function coerceSafeInt(value) {
    if (value === "") {
        throw new error_1.ValidationInternalError({
            message: "SafeInt cannot represent non 53-bit signed integer value: (empty string)",
            logger: logger_1.baseLogger,
        });
    }
    const num = Number(value);
    if (num !== value || num > MAX_INT || num < MIN_INT) {
        throw new error_1.ValidationInternalError({
            message: "SafeInt cannot represent non 53-bit signed integer value: " + String(value),
            logger: logger_1.baseLogger,
        });
    }
    const int = Math.floor(num);
    if (int !== num) {
        throw new error_1.ValidationInternalError({
            message: "SafeInt cannot represent non-integer value: " + String(value),
            logger: logger_1.baseLogger,
        });
    }
    return int;
}
exports.default = SafeInt;
//# sourceMappingURL=safe-int.js.map