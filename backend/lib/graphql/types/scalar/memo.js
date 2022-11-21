"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _config_1 = require("../../../config/index");
const error_1 = require("../../error");
const index_1 = require("../../index");
const Memo = index_1.GT.Scalar({
    name: "Memo",
    description: "Text field in a lightning payment transaction",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for Memo" });
        }
        return validMemo(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validMemo(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for Memo" });
    },
});
function validMemo(value) {
    if (Buffer.byteLength(value, "utf8") <= _config_1.MAX_BYTES_FOR_MEMO) {
        return value;
    }
    return new error_1.InputValidationError({ message: "Memo is too long" });
}
exports.default = Memo;
//# sourceMappingURL=memo.js.map