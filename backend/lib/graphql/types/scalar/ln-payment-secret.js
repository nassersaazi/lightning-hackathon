"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoin_1 = require("../../../domain/bitcoin");
const error_1 = require("../../error");
const index_1 = require("../../index");
const LnPaymentSecret = index_1.GT.Scalar({
    name: "LnPaymentSecret",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for LnPaymentSecret" });
        }
        return validLnPaymentSecret(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validLnPaymentSecret(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for LnPaymentSecret" });
    },
});
function validLnPaymentSecret(value) {
    return (0, bitcoin_1.isSha256Hash)(value)
        ? value
        : new error_1.InputValidationError({ message: "Invalid value for LnPaymentSecret" });
}
exports.default = LnPaymentSecret;
//# sourceMappingURL=ln-payment-secret.js.map