"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("../../../domain/shared");
const error_1 = require("../../error");
const index_1 = require("../../index");
const tracing_1 = require("../../../services/tracing");
const SatAmount = index_1.GT.Scalar({
    name: "SatAmount",
    description: "(Positive) Satoshi amount",
    parseValue(value) {
        if (typeof value !== "string" && typeof value !== "number") {
            return new error_1.InputValidationError({ message: "Invalid type for SatAmount" });
        }
        return validSatAmount(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.INT) {
            return validSatAmount(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for SatAmount" });
    },
});
function validSatAmount(value) {
    let intValue;
    if (typeof value === "number") {
        // TODO: remove trunc and recordExceptionInCurrentSpan once mobile app is fixed
        intValue = Math.trunc(value);
        if (!Number.isInteger(value)) {
            (0, tracing_1.recordExceptionInCurrentSpan)({
                error: new error_1.InputValidationError({ message: "Float value for SatAmount" }),
                level: shared_1.ErrorLevel.Warn,
            });
        }
    }
    else {
        intValue = Number.parseInt(value, 10);
    }
    if (!(Number.isInteger(intValue) && intValue >= 0)) {
        return new error_1.InputValidationError({ message: "Invalid value for SatAmount" });
    }
    if (intValue > shared_1.MAX_SATS.amount) {
        return new error_1.InputValidationError({ message: "Value too big for SatAmount" });
    }
    return intValue;
}
exports.default = SatAmount;
//# sourceMappingURL=sat-amount.js.map