"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const InvoicePaymentStatus = index_1.GT.Enum({
    name: "InvoicePaymentStatus",
    values: {
        PENDING: {},
        PAID: {},
    },
});
exports.default = InvoicePaymentStatus;
//# sourceMappingURL=invoice-payment-status.js.map