"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_map_1 = require("../../error-map");
const memo_1 = __importDefault(require("../../types/scalar/memo"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const cent_amount_1 = __importDefault(require("../../types/scalar/cent-amount"));
const ln_invoice_1 = __importDefault(require("../../types/payload/ln-invoice"));
const helpers_1 = require("../../helpers");
const _app_1 = require("../../../app/index");
const dedent_1 = __importDefault(require("dedent"));
const LnUsdInvoiceCreateInput = index_1.GT.Input({
    name: "LnUsdInvoiceCreateInput",
    fields: () => ({
        walletId: {
            type: index_1.GT.NonNull(wallet_id_1.default),
            description: "Wallet ID for a USD wallet belonging to the current user.",
        },
        amount: { type: index_1.GT.NonNull(cent_amount_1.default), description: "Amount in USD cents." },
        memo: { type: memo_1.default, description: "Optional memo for the lightning invoice." },
    }),
});
const LnUsdInvoiceCreateMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(ln_invoice_1.default),
    description: (0, dedent_1.default) `Returns a lightning invoice denominated in satoshis for an associated wallet.
  When invoice is paid the equivalent value at invoice creation will be credited to a USD wallet.
  Expires after 5 minutes (short expiry time because there is a USD/BTC exchange rate
  associated with the amount).`,
    args: {
        input: { type: index_1.GT.NonNull(LnUsdInvoiceCreateInput) },
    },
    resolve: async (_, args) => {
        const { walletId, memo, amount } = args.input;
        for (const input of [walletId, memo, amount]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        const usdWalletValidated = await (0, helpers_1.validateIsUsdWalletForMutation)(walletId);
        if (usdWalletValidated != true)
            return usdWalletValidated;
        const lnInvoice = await _app_1.Wallets.addInvoiceForSelf({
            walletId,
            amount,
            memo,
        });
        if (lnInvoice instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(lnInvoice)] };
        }
        return {
            errors: [],
            invoice: lnInvoice,
        };
    },
});
exports.default = LnUsdInvoiceCreateMutation;
//# sourceMappingURL=ln-usd-invoice-create.js.map