"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const accounts_1 = require("../../../domain/accounts");
const error_1 = require("../../error");
const index_1 = require("../../index");
const Username = index_1.GT.Scalar({
    name: "Username",
    description: "Unique identifier of a user",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for Username" });
        }
        return validUsernameValue(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validUsernameValue(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for Username" });
    },
});
function validUsernameValue(value) {
    if (value.match(accounts_1.UsernameRegex)) {
        return value.toLowerCase();
    }
    return new error_1.InputValidationError({ message: "Invalid value for Username" });
}
exports.default = Username;
//# sourceMappingURL=username.js.map