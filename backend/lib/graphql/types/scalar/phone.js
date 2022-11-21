"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = require("../../../domain/users");
const error_1 = require("../../error");
const index_1 = require("../../index");
const Phone = index_1.GT.Scalar({
    name: "Phone",
    description: "Phone number which includes country code",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for Phone" });
        }
        return validPhoneValue(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validPhoneValue(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for Phone" });
    },
});
function validPhoneValue(value) {
    const phoneNumberValid = (0, users_1.checkedToPhoneNumber)(value);
    if (phoneNumberValid instanceof Error)
        return new error_1.InputValidationError({ message: "Invalid value for Phone" });
    return phoneNumberValid;
}
exports.default = Phone;
//# sourceMappingURL=phone.js.map