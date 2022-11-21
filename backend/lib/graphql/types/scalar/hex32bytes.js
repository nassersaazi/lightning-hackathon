"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../../error");
const index_1 = require("../../index");
const Hex32Bytes = index_1.GT.Scalar({
    name: "Hex32Bytes",
    description: "Hex-encoded string of 32 bytes",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for Hex32Bytes" });
        }
        return validHex32Bytes(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validHex32Bytes(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for Hex32Bytes" });
    },
});
function validHex32Bytes(value) {
    const bytes = Buffer.from(value, "hex");
    if (bytes.toString("hex") !== value) {
        return new error_1.InputValidationError({ message: "Hex32Bytes is not valid hex" });
    }
    if (Buffer.byteLength(bytes) !== 32) {
        return new error_1.InputValidationError({ message: "Hex32Bytes is not 32 bytes" });
    }
    return value;
}
exports.default = Hex32Bytes;
//# sourceMappingURL=hex32bytes.js.map