"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoin_1 = require("../../../domain/bitcoin");
const error_1 = require("../../error");
const index_1 = require("../../index");
const PaymentHash = index_1.GT.Scalar({
    name: "PaymentHash",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for PaymentHash" });
        }
        return validPaymentHash(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validPaymentHash(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for PaymentHash" });
    },
});
function validPaymentHash(value) {
    return (0, bitcoin_1.isSha256Hash)(value)
        ? value
        : new error_1.InputValidationError({ message: "Invalid value for PaymentHash" });
}
exports.default = PaymentHash;
//# sourceMappingURL=payment-hash.js.map