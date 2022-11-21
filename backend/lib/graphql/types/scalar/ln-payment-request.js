"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../../error");
const index_1 = require("../../index");
const LnPaymentRequest = index_1.GT.Scalar({
    name: "LnPaymentRequest",
    description: "BOLT11 lightning invoice payment request with the amount included",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for LnPaymentRequest" });
        }
        return validLnPaymentRequest(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validLnPaymentRequest(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for LnPaymentRequest" });
    },
});
function validLnPaymentRequest(value) {
    // TODO: add network type
    // TODO: limit length of the invoice
    if (value.match(/^ln[a-z0-9]+$/i)) {
        return value;
    }
    return new error_1.InputValidationError({ message: "Invalid value for LnPaymentRequest" });
}
exports.default = LnPaymentRequest;
//# sourceMappingURL=ln-payment-request.js.map