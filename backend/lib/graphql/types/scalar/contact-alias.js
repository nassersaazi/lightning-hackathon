"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../../error");
const index_1 = require("../../index");
const ContactAlias = index_1.GT.Scalar({
    name: "ContactAlias",
    description: "An alias name that a user can set for a wallet (with which they have transactions)",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for AuthToken" });
        }
        return validContactAliasValue(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validContactAliasValue(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for ContactAlias" });
    },
});
function validContactAliasValue(value) {
    if (value.match(/^[\p{Alpha}][\p{Alpha} -]{3,}/u)) {
        return value;
    }
    return new error_1.InputValidationError({ message: "Invalid value for ContactAlias" });
}
exports.default = ContactAlias;
//# sourceMappingURL=contact-alias.js.map