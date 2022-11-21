"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../../error");
const index_1 = require("../../index");
const SignedAmount = index_1.GT.Scalar({
    name: "SignedAmount",
    // FIXME: should be SignedInteger. value is tested for integer
    description: "An amount (of a currency) that can be negative (e.g. in a transaction)",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for SignedAmount" });
        }
        return validSignedAmount(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.INT) {
            return validSignedAmount(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for SignedAmount" });
    },
});
function validSignedAmount(value) {
    let intValue;
    if (typeof value === "number") {
        intValue = value;
    }
    else {
        intValue = Number.parseInt(value, 10);
    }
    if (Number.isInteger(intValue)) {
        return value;
    }
    return new error_1.InputValidationError({ message: "Invalid value for SignedAmount" });
}
exports.default = SignedAmount;
//# sourceMappingURL=signed-amount.js.map