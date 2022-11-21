"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const error_map_1 = require("../../error-map");
const index_1 = require("../../index");
const ln_noamount_invoice_1 = __importDefault(require("../../types/payload/ln-noamount-invoice"));
const memo_1 = __importDefault(require("../../types/scalar/memo"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const dedent_1 = __importDefault(require("dedent"));
const LnNoAmountInvoiceCreateOnBehalfOfRecipientInput = index_1.GT.Input({
    name: "LnNoAmountInvoiceCreateOnBehalfOfRecipientInput",
    fields: () => ({
        recipientWalletId: {
            type: index_1.GT.NonNull(wallet_id_1.default),
            description: "ID for either a USD or BTC wallet which belongs to the account of any user.",
        },
        memo: { type: memo_1.default, description: "Optional memo for the lightning invoice." },
    }),
});
const LnNoAmountInvoiceCreateOnBehalfOfRecipientMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(ln_noamount_invoice_1.default),
    description: (0, dedent_1.default) `Returns a lightning invoice for an associated wallet.
  Can be used to receive any supported currency value (currently USD or BTC).
  Expires after 24 hours.`,
    args: {
        input: { type: index_1.GT.NonNull(LnNoAmountInvoiceCreateOnBehalfOfRecipientInput) },
    },
    resolve: async (_, args) => {
        const { recipientWalletId, memo } = args.input;
        for (const input of [recipientWalletId, memo]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        const result = await _app_1.Wallets.addInvoiceNoAmountForRecipient({
            recipientWalletId,
            memo,
        });
        if (result instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(result)] };
        }
        const { paymentRequest, paymentHash, paymentSecret } = result;
        return {
            errors: [],
            invoice: {
                paymentRequest,
                paymentHash,
                paymentSecret,
            },
        };
    },
});
exports.default = LnNoAmountInvoiceCreateOnBehalfOfRecipientMutation;
//# sourceMappingURL=ln-noamount-invoice-create-on-behalf-of-recipient.js.map