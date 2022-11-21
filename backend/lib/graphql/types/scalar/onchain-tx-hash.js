"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoin_1 = require("../../../domain/bitcoin");
const error_1 = require("../../error");
const index_1 = require("../../index");
const OnChainTxHash = index_1.GT.Scalar({
    name: "OnChainTxHash",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for OnChainTxHash" });
        }
        return validOnChainTxHash(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validOnChainTxHash(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for OnChainTxHash" });
    },
});
function validOnChainTxHash(value) {
    return (0, bitcoin_1.isSha256Hash)(value)
        ? value
        : new error_1.InputValidationError({ message: "Invalid value for OnChainTxHash" });
}
exports.default = OnChainTxHash;
//# sourceMappingURL=onchain-tx-hash.js.map