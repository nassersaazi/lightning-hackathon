"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../../error");
const index_1 = require("../../index");
const Timestamp = index_1.GT.Scalar({
    name: "Timestamp",
    description: "Timestamp field, serialized as Unix time (the number of seconds since the Unix epoch)",
    serialize(value) {
        if (value instanceof Date) {
            return Math.floor(value.getTime() / 1000);
        }
        if (typeof value === "number") {
            return value;
        }
        return new error_1.InputValidationError({ message: "Invalid value for Date" });
    },
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for Date" });
        }
        return new Date(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return new Date(parseInt(ast.value, 10));
        }
        return new error_1.InputValidationError({ message: "Invalid type for Date" });
    },
});
// TODO: validate date value
exports.default = Timestamp;
//# sourceMappingURL=timestamp.js.map