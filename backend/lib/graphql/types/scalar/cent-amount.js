"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("../../../domain/shared");
const error_1 = require("../../error");
const index_1 = require("../../index");
const CentAmount = index_1.GT.Scalar({
    name: "CentAmount",
    description: "(Positive) Cent amount (1/100 of a dollar)",
    parseValue(value) {
        if (typeof value !== "string" && typeof value !== "number") {
            return new error_1.InputValidationError({ message: "Invalid type for CentAmount" });
        }
        return validCentAmount(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.INT) {
            return validCentAmount(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for CentAmount" });
    },
});
function validCentAmount(value) {
    let intValue;
    if (typeof value === "number") {
        intValue = value;
    }
    else {
        intValue = Number.parseInt(value, 10);
    }
    if (!(Number.isInteger(intValue) && intValue >= 0)) {
        return new error_1.InputValidationError({ message: "Invalid value for CentAmount" });
    }
    if (intValue > shared_1.MAX_CENTS.amount) {
        return new error_1.InputValidationError({ message: "Value too big for CentAmount" });
    }
    return intValue;
}
exports.default = CentAmount;
//# sourceMappingURL=cent-amount.js.map