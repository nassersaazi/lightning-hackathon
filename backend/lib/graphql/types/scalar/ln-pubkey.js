"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lightning_1 = require("../../../domain/bitcoin/lightning");
const error_1 = require("../../error");
const index_1 = require("../../index");
const LnPubkey = index_1.GT.Scalar({
    name: "LnPubkey",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for LnPubkey" });
        }
        return validLnPubkey(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validLnPubkey(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for LnPubkey" });
    },
});
function validLnPubkey(value) {
    const pubkey = (0, lightning_1.checkedToPubkey)(value);
    if (pubkey instanceof Error) {
        return new error_1.InputValidationError({ message: "Invalid value for LnPubkey" });
    }
    return pubkey;
}
exports.default = LnPubkey;
//# sourceMappingURL=ln-pubkey.js.map