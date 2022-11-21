"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const AuthToken = index_1.GT.Scalar({
    name: "AuthToken",
    description: "An Opaque Bearer token",
    serialize(value) {
        if (typeof value !== "string") {
            return "Invalid value for AuthToken";
        }
        return validAuthTokenValue(value);
    },
});
function validAuthTokenValue(value) {
    if (value.length !== 32) {
        return "Invalid value for AuthToken";
    }
    return value;
}
exports.default = AuthToken;
//# sourceMappingURL=auth-token.js.map