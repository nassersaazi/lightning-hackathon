"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const sat_amount_1 = __importDefault(require("../scalar/sat-amount"));
const target_confirmations_1 = __importDefault(require("../scalar/target-confirmations"));
const OnChainTxFee = index_1.GT.Object({
    name: "OnChainTxFee",
    fields: () => ({
        amount: { type: index_1.GT.NonNull(sat_amount_1.default) },
        targetConfirmations: { type: index_1.GT.NonNull(target_confirmations_1.default) },
    }),
});
exports.default = OnChainTxFee;
//# sourceMappingURL=onchain-tx-fee.js.map