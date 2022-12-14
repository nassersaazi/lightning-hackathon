"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_map_1 = require("../../error-map");
const memo_1 = __importDefault(require("../../types/scalar/memo"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const _app_1 = require("../../../app/index");
const payment_send_1 = __importDefault(require("../../types/payload/payment-send"));
const ln_payment_request_1 = __importDefault(require("../../types/scalar/ln-payment-request"));
const error_1 = require("../../error");
const cent_amount_1 = __importDefault(require("../../types/scalar/cent-amount"));
const helpers_1 = require("../../helpers");
const dedent_1 = __importDefault(require("dedent"));
const LnNoAmountUsdInvoicePaymentInput = index_1.GT.Input({
    name: "LnNoAmountUsdInvoicePaymentInput",
    fields: () => ({
        walletId: {
            type: index_1.GT.NonNull(wallet_id_1.default),
            description: "Wallet ID with sufficient balance to cover amount defined in mutation request.  Must belong to the account of the current user.",
        },
        paymentRequest: {
            type: index_1.GT.NonNull(ln_payment_request_1.default),
            description: "Payment request representing the invoice which is being paid.",
        },
        amount: { type: index_1.GT.NonNull(cent_amount_1.default), description: "Amount to pay in USD cents." },
        memo: {
            type: memo_1.default,
            description: "Optional memo to associate with the lightning invoice.",
        },
    }),
});
const LnNoAmountUsdInvoicePaymentSendMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(payment_send_1.default),
    description: (0, dedent_1.default) `Pay a lightning invoice using a balance from a wallet which is owned by the account of the current user.
  Provided wallet must be USD and have sufficient balance to cover amount specified in mutation request.
  Returns payment status (success, failed, pending, already_paid).`,
    args: {
        input: { type: index_1.GT.NonNull(LnNoAmountUsdInvoicePaymentInput) },
    },
    resolve: async (_, args, { domainAccount }) => {
        const { walletId, paymentRequest, amount, memo } = args.input;
        if (walletId instanceof error_1.InputValidationError) {
            return { errors: [{ message: walletId.message }] };
        }
        if (paymentRequest instanceof error_1.InputValidationError) {
            return { errors: [{ message: paymentRequest.message }] };
        }
        if (amount instanceof error_1.InputValidationError) {
            return { errors: [{ message: amount.message }] };
        }
        if (memo instanceof error_1.InputValidationError) {
            return { errors: [{ message: memo.message }] };
        }
        const usdWalletValidated = await (0, helpers_1.validateIsUsdWalletForMutation)(walletId);
        if (usdWalletValidated != true)
            return usdWalletValidated;
        const status = await _app_1.Payments.payNoAmountInvoiceByWalletId({
            senderWalletId: walletId,
            uncheckedPaymentRequest: paymentRequest,
            memo: memo ?? null,
            amount,
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
exports.default = LnNoAmountUsdInvoicePaymentSendMutation;
//# sourceMappingURL=ln-noamount-usd-invoice-payment-send.js.map