"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const sat_amount_1 = __importDefault(require("../../../types/scalar/sat-amount"));
const PsbtDetail = index_1.GT.Object({
    name: "PsbtDetail",
    fields: () => ({
        transaction: { type: index_1.GT.NonNull(index_1.GT.String) },
        fee: { type: index_1.GT.NonNull(sat_amount_1.default) },
    }),
});
exports.default = PsbtDetail;
//# sourceMappingURL=psbt-detail.js.map