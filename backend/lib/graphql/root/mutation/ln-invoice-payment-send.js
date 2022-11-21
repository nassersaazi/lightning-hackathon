"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const error_1 = require("../../error");
const error_map_1 = require("../../error-map");
const index_1 = require("../../index");
const payment_send_1 = __importDefault(require("../../types/payload/payment-send"));
const ln_payment_request_1 = __importDefault(require("../../types/scalar/ln-payment-request"));
const memo_1 = __importDefault(require("../../types/scalar/memo"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const dedent_1 = __importDefault(require("dedent"));
const LnInvoicePaymentInput = index_1.GT.Input({
    name: "LnInvoicePaymentInput",
    fields: () => ({
        walletId: {
            type: index_1.GT.NonNull(wallet_id_1.default),
            description: "Wallet ID with sufficient balance to cover amount of invoice.  Must belong to the account of the current user.",
        },
        paymentRequest: {
            type: index_1.GT.NonNull(ln_payment_request_1.default),
            description: "Payment request representing the invoice which is being paid.",
        },
        memo: {
            type: memo_1.default,
            description: "Optional memo to associate with the lightning invoice.",
        },
    }),
});
const LnInvoicePaymentSendMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(payment_send_1.default),
    description: (0, dedent_1.default) `Pay a lightning invoice using a balance from a wallet which is owned by the account of the current user.
  Provided wallet can be USD or BTC and must have sufficient balance to cover amount in lightning invoice.
  Returns payment status (success, failed, pending, already_paid).`,
    args: {
        input: { type: index_1.GT.NonNull(LnInvoicePaymentInput) },
    },
    resolve: async (_, args, { domainAccount }) => {
        const { walletId, paymentRequest, memo } = args.input;
        if (walletId instanceof error_1.InputValidationError) {
            return { errors: [{ message: walletId.message }] };
        }
        if (paymentRequest instanceof error_1.InputValidationError) {
            return { errors: [{ message: paymentRequest.message }] };
        }
        if (memo instanceof error_1.InputValidationError) {
            return { errors: [{ message: memo.message }] };
        }
        const status = await _app_1.Payments.payInvoiceByWalletId({
            senderWalletId: walletId,
            uncheckedPaymentRequest: paymentRequest,
            memo: memo ?? null,
            senderAccount: domainAccount,
        });
        if (status instanceof Error) {
            return { status: "failed", errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(status)] };
        }
        return {
            errors: [],
            status: status.value,
        };
    },
});
exports.default = LnInvoicePaymentSendMutation;
//# sourceMappingURL=ln-invoice-payment-send.js.map