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
const cent_amount_1 = __importDefault(require("../../types/scalar/cent-amount"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const helpers_1 = require("../../helpers");
const dedent_1 = __importDefault(require("dedent"));
const LnUsdInvoiceCreateOnBehalfOfRecipientInput = index_1.GT.Input({
    name: "LnUsdInvoiceCreateOnBehalfOfRecipientInput",
    fields: () => ({
        recipientWalletId: {
            type: index_1.GT.NonNull(wallet_id_1.default),
            description: "Wallet ID for a USD wallet which belongs to the account of any user.",
        },
        amount: { type: index_1.GT.NonNull(cent_amount_1.default), description: "Amount in USD cents." },
        memo: {
            type: memo_1.default,
            description: "Optional memo for the lightning invoice. Acts as a note to the recipient.",
        },
        descriptionHash: { type: hex32bytes_1.default },
    }),
});
const LnUsdInvoiceCreateOnBehalfOfRecipientMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(ln_invoice_1.default),
    description: (0, dedent_1.default) `Returns a lightning invoice denominated in satoshis for an associated wallet.
  When invoice is paid the equivalent value at invoice creation will be credited to a USD wallet.
  Expires after 5 minutes (short expiry time because there is a USD/BTC exchange rate
    associated with the amount).`,
    args: {
        input: { type: index_1.GT.NonNull(LnUsdInvoiceCreateOnBehalfOfRecipientInput) },
    },
    resolve: async (_, args) => {
        const { recipientWalletId, amount, memo, descriptionHash } = args.input;
        for (const input of [recipientWalletId, amount, memo, descriptionHash]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        const usdWalletValidated = await (0, helpers_1.validateIsUsdWalletForMutation)(recipientWalletId);
        if (usdWalletValidated != true)
            return usdWalletValidated;
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
exports.default = LnUsdInvoiceCreateOnBehalfOfRecipientMutation;
//# sourceMappingURL=ln-usd-invoice-create-on-behalf-of-recipient.js.map