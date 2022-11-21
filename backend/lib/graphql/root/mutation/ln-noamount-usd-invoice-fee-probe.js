"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lightning_1 = require("../../../domain/bitcoin/lightning");
const _app_1 = require("../../../app/index");
const index_1 = require("../../index");
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const cent_amount_1 = __importDefault(require("../../types/scalar/cent-amount"));
const cent_amount_2 = __importDefault(require("../../types/payload/cent-amount"));
const ln_payment_request_1 = __importDefault(require("../../types/scalar/ln-payment-request"));
const error_map_1 = require("../../error-map");
const helpers_1 = require("../../helpers");
const _1 = require(".");
const LnNoAmountUsdInvoiceFeeProbeInput = index_1.GT.Input({
    name: "LnNoAmountUsdInvoiceFeeProbeInput",
    fields: () => ({
        walletId: { type: index_1.GT.NonNull(wallet_id_1.default) },
        paymentRequest: { type: index_1.GT.NonNull(ln_payment_request_1.default) },
        amount: { type: index_1.GT.NonNull(cent_amount_1.default) },
    }),
});
const LnNoAmountUsdInvoiceFeeProbeMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(cent_amount_2.default),
    args: {
        input: { type: index_1.GT.NonNull(LnNoAmountUsdInvoiceFeeProbeInput) },
    },
    resolve: async (_, args) => {
        const { walletId, paymentRequest, amount } = args.input;
        for (const input of [walletId, paymentRequest, amount]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        const usdWalletValidated = await (0, helpers_1.validateIsUsdWalletForMutation)(walletId);
        if (usdWalletValidated != true)
            return usdWalletValidated;
        const { result: feeSatAmount, error } = await _app_1.Payments.getNoAmountLightningFeeEstimation({
            walletId,
            amount,
            uncheckedPaymentRequest: paymentRequest,
        });
        if (feeSatAmount !== null && error instanceof Error) {
            return {
                errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(error)],
                ...(0, _1.normalizePaymentAmount)(feeSatAmount),
            };
        }
        if (error instanceof Error) {
            return {
                errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(error)],
            };
        }
        if (feeSatAmount === null) {
            return {
                errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(new lightning_1.InvalidFeeProbeStateError())],
            };
        }
        return {
            errors: [],
            ...(0, _1.normalizePaymentAmount)(feeSatAmount),
        };
    },
});
exports.default = LnNoAmountUsdInvoiceFeeProbeMutation;
//# sourceMappingURL=ln-noamount-usd-invoice-fee-probe.js.map