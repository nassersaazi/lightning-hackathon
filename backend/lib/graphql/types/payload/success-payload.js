"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const SuccessPayload = index_1.GT.Object({
    name: "SuccessPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        success: {
            type: index_1.GT.Boolean,
        },
    }),
});
exports.default = SuccessPayload;
//# sourceMappingURL=success-payload.js.map