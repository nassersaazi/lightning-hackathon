"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const wallets_1 = require("../../../domain/wallets");
const error_map_1 = require("../../error-map");
const helpers_1 = require("../../helpers");
const index_1 = require("../../index");
const payment_send_1 = __importDefault(require("../../types/payload/payment-send"));
const cent_amount_1 = __importDefault(require("../../types/scalar/cent-amount"));
const memo_1 = __importDefault(require("../../types/scalar/memo"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const dedent_1 = __importDefault(require("dedent"));
const IntraLedgerUsdPaymentSendInput = index_1.GT.Input({
    name: "IntraLedgerUsdPaymentSendInput",
    fields: () => ({
        walletId: { type: index_1.GT.NonNull(wallet_id_1.default), description: "The wallet ID of the sender." },
        recipientWalletId: { type: index_1.GT.NonNull(wallet_id_1.default) },
        amount: { type: index_1.GT.NonNull(cent_amount_1.default), description: "Amount in cents." },
        memo: { type: memo_1.default, description: "Optional memo to be attached to the payment." },
    }),
});
const IntraLedgerUsdPaymentSendMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(payment_send_1.default),
    description: (0, dedent_1.default) `Actions a payment which is internal to the ledger e.g. it does
  not use onchain/lightning. Returns payment status (success,
  failed, pending, already_paid).`,
    args: {
        input: { type: index_1.GT.NonNull(IntraLedgerUsdPaymentSendInput) },
    },
    resolve: async (_, args, { domainAccount }) => {
        const { walletId, recipientWalletId, amount, memo } = args.input;
        for (const input of [walletId, recipientWalletId, amount, memo]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        const senderWalletId = (0, wallets_1.checkedToWalletId)(walletId);
        if (senderWalletId instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(senderWalletId)] };
        }
        const usdWalletValidated = await (0, helpers_1.validateIsUsdWalletForMutation)(walletId);
        if (usdWalletValidated != true)
            return usdWalletValidated;
        const recipientWalletIdChecked = (0, wallets_1.checkedToWalletId)(recipientWalletId);
        if (recipientWalletIdChecked instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(recipientWalletIdChecked)] };
        }
        // TODO: confirm whether we need to check for username here
        const recipientUsername = await _app_1.Accounts.getUsernameFromWalletId(recipientWalletIdChecked);
        if (recipientUsername instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(recipientUsername)] };
        }
        const status = await _app_1.Payments.intraledgerPaymentSendWalletId({
            recipientWalletId,
            memo,
            amount,
            senderWalletId: walletId,
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
exports.default = IntraLedgerUsdPaymentSendMutation;
//# sourceMappingURL=intraledger-usd-payment-send.js.map