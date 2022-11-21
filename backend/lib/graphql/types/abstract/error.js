"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const IError = index_1.GT.Interface({
    name: "Error",
    fields: () => ({
        message: {
            type: index_1.GT.NonNull(index_1.GT.String),
        },
        path: {
            type: index_1.GT.List(index_1.GT.String),
        },
        code: {
            type: index_1.GT.String,
        },
    }),
});
exports.default = IError;
//# sourceMappingURL=error.js.map