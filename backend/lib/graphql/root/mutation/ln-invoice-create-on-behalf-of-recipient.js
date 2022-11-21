"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const error_map_1 = require("../../error-map");
const index_1 = require("../../index");
const ln_invoice_1 = __importDefault(require("../../types/payload/ln-invoice"));
const memo_1 = __importDefault(require("../../types/scalar/memo"));
const hex32bytes_1 = __importDefault(require("../../types/scalar/hex32bytes"));
const sat_amount_1 = __importDefault(require("../../types/scalar/sat-amount"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const helpers_1 = require("../../helpers");
const dedent_1 = __importDefault(require("dedent"));
const LnInvoiceCreateOnBehalfOfRecipientInput = index_1.GT.Input({
    name: "LnInvoiceCreateOnBehalfOfRecipientInput",
    fields: () => ({
        recipientWalletId: {
            type: index_1.GT.NonNull(wallet_id_1.default),
            description: "Wallet ID for a BTC wallet which belongs to any account.",
        },
        amount: { type: index_1.GT.NonNull(sat_amount_1.default), description: "Amount in satoshis." },
        memo: { type: memo_1.default, description: "Optional memo for the lightning invoice." },
        descriptionHash: { type: hex32bytes_1.default },
    }),
});
const LnInvoiceCreateOnBehalfOfRecipientMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(ln_invoice_1.default),
    description: (0, dedent_1.default) `Returns a lightning invoice for an associated wallet.
  When invoice is paid the value will be credited to a BTC wallet.
  Expires after 24 hours.`,
    args: {
        input: { type: index_1.GT.NonNull(LnInvoiceCreateOnBehalfOfRecipientInput) },
    },
    resolve: async (_, args) => {
        const { recipientWalletId, amount, memo, descriptionHash } = args.input;
        for (const input of [recipientWalletId, amount, memo, descriptionHash]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        const btcWalletValidated = await (0, helpers_1.validateIsBtcWalletForMutation)(recipientWalletId);
        if (btcWalletValidated != true)
            return btcWalletValidated;
        const invoice = await _app_1.Wallets.addInvoiceForRecipient({
            recipientWalletId,
            amount,
            memo,
            descriptionHash,
        });
        if (invoice instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(invoice)] };
        }
        return {
            errors: [],
            invoice,
        };
    },
});
exports.default = LnInvoiceCreateOnBehalfOfRecipientMutation;
//# sourceMappingURL=ln-invoice-create-on-behalf-of-recipient.js.map