"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_map_1 = require("../../error-map");
const memo_1 = __importDefault(require("../../types/scalar/memo"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const sat_amount_1 = __importDefault(require("../../types/scalar/sat-amount"));
const ln_invoice_1 = __importDefault(require("../../types/payload/ln-invoice"));
const helpers_1 = require("../../helpers");
const _app_1 = require("../../../app/index");
const dedent_1 = __importDefault(require("dedent"));
const LnInvoiceCreateInput = index_1.GT.Input({
    name: "LnInvoiceCreateInput",
    fields: () => ({
        walletId: {
            type: index_1.GT.NonNull(wallet_id_1.default),
            description: "Wallet ID for a BTC wallet belonging to the current account.",
        },
        amount: { type: index_1.GT.NonNull(sat_amount_1.default), description: "Amount in satoshis." },
        memo: { type: memo_1.default, description: "Optional memo for the lightning invoice." },
    }),
});
const LnInvoiceCreateMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(ln_invoice_1.default),
    description: (0, dedent_1.default) `Returns a lightning invoice for an associated wallet.
  When invoice is paid the value will be credited to a BTC wallet.
  Expires after 24 hours.`,
    args: {
        input: { type: index_1.GT.NonNull(LnInvoiceCreateInput) },
    },
    resolve: async (_, args) => {
        const { walletId, memo, amount } = args.input;
        for (const input of [walletId, memo, amount]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        const btcWalletValidated = await (0, helpers_1.validateIsBtcWalletForMutation)(walletId);
        if (btcWalletValidated != true)
            return btcWalletValidated;
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
exports.default = LnInvoiceCreateMutation;
//# sourceMappingURL=ln-invoice-create.js.map