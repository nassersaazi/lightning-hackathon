"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const LnPaymentStatus = index_1.GT.Enum({
    name: "LnPaymentStatus",
    values: {
        PENDING: { value: "pending" },
        FAILED: { value: "failed" },
        SETTLED: { value: "settled" },
    },
});
exports.default = LnPaymentStatus;
//# sourceMappingURL=ln-payment-status.js.map