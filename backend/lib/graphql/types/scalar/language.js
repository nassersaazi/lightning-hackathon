"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = require("../../../domain/users");
const error_1 = require("../../error");
const index_1 = require("../../index");
const Language = index_1.GT.Scalar({
    name: "Language",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for OnChainTxHash" });
        }
        return validLanguageValue(value);
    },
    parseLiteral(valueNode) {
        if (valueNode.kind === index_1.GT.Kind.STRING) {
            return validLanguageValue(valueNode.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for Language" });
    },
});
function validLanguageValue(value) {
    if (value === "" || value === "DEFAULT") {
        return "";
    }
    if (users_1.Languages.includes(value)) {
        return value;
    }
    return new error_1.InputValidationError({ message: "Invalid value for Language" });
}
exports.default = Language;
//# sourceMappingURL=language.js.map