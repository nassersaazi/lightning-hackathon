"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const error_1 = __importDefault(require("../../../types/abstract/error"));
const psbt_detail_1 = __importDefault(require("../object/psbt-detail"));
const PsbtDetailPayload = index_1.GT.Object({
    name: "PsbtDetailPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        psbtDetail: {
            type: psbt_detail_1.default,
        },
    }),
});
exports.default = PsbtDetailPayload;
//# sourceMappingURL=psbt-detail.js.map