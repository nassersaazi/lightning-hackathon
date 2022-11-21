"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../../error");
const index_1 = require("../../index");
const OneTimeAuthCode = index_1.GT.Scalar({
    name: "OneTimeAuthCode",
    description: "An authentication code valid for a single use",
    // FIXME: OneTimeAuthCode is being used for graphql, but PhoneCode is the domain type
    // this is confusing, as OneTimeAuthCode may suggest a google authenticator code.
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for OneTimeAuthCode" });
        }
        return validOneTimeAuthCodeValue(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validOneTimeAuthCodeValue(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for OneTimeAuthCode" });
    },
});
function validOneTimeAuthCodeValue(value) {
    if (value.match(/^[0-9]{6}/i)) {
        return value.toLowerCase();
    }
    return new error_1.InputValidationError({ message: "Invalid value for OneTimeAuthCode" });
}
exports.default = OneTimeAuthCode;
//# sourceMappingURL=one-time-auth-code.js.map