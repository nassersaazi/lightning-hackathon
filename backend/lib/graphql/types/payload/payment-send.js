"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const payment_send_result_1 = __importDefault(require("../scalar/payment-send-result"));
const PaymentSendPayload = index_1.GT.Object({
    name: "PaymentSendPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        status: { type: payment_send_result_1.default },
    }),
});
exports.default = PaymentSendPayload;
//# sourceMappingURL=payment-send.js.map