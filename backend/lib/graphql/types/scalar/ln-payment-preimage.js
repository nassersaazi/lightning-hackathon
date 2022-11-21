"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoin_1 = require("../../../domain/bitcoin");
const error_1 = require("../../error");
const index_1 = require("../../index");
const LnPaymentPreImage = index_1.GT.Scalar({
    name: "LnPaymentPreImage",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for LnPaymentPreImage" });
        }
        return validLnPaymentPreImage(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validLnPaymentPreImage(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for LnPaymentPreImage" });
    },
});
function validLnPaymentPreImage(value) {
    return (0, bitcoin_1.isSha256Hash)(value)
        ? value
        : new error_1.InputValidationError({ message: "Invalid value for LnPaymentPreImage" });
}
exports.default = LnPaymentPreImage;
//# sourceMappingURL=ln-payment-preimage.js.map