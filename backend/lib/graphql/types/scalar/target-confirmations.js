"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoin_1 = require("../../../domain/bitcoin");
const error_1 = require("../../error");
const index_1 = require("../../index");
const TargetConfirmations = index_1.GT.Scalar({
    name: "TargetConfirmations",
    description: "(Positive) Number of blocks in which the transaction is expected to be confirmed",
    parseValue(value) {
        if (typeof value !== "string" && typeof value !== "number") {
            return new error_1.InputValidationError({ message: "Invalid type for TargetConfirmations" });
        }
        return validTargetConfirmations(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.INT) {
            return validTargetConfirmations(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for TargetConfirmations" });
    },
});
function validTargetConfirmations(value) {
    const valueAsString = value + "";
    const intValue = Number.parseInt(valueAsString, 10);
    const targetConfValid = (0, bitcoin_1.checkedToTargetConfs)(intValue);
    if (targetConfValid instanceof Error) {
        return new error_1.InputValidationError({ message: "Invalid value for TargetConfirmations" });
    }
    return targetConfValid;
}
exports.default = TargetConfirmations;
//# sourceMappingURL=target-confirmations.js.map