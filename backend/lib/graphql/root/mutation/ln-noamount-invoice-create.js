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
const LnNoAmountInvoiceCreateInput = index_1.GT.Input({
    name: "LnNoAmountInvoiceCreateInput",
    fields: () => ({
        walletId: {
            type: index_1.GT.NonNull(wallet_id_1.default),
            description: "ID for either a USD or BTC wallet belonging to the account of the current user.",
        },
        memo: { type: memo_1.default, description: "Optional memo for the lightning invoice." },
    }),
});
const LnNoAmountInvoiceCreateMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(ln_noamount_invoice_1.default),
    description: (0, dedent_1.default) `Returns a lightning invoice for an associated wallet.
  Can be used to receive any supported currency value (currently USD or BTC).
  Expires after 24 hours.`,
    args: {
        input: { type: index_1.GT.NonNull(LnNoAmountInvoiceCreateInput) },
    },
    resolve: async (_, args) => {
        const { walletId, memo } = args.input;
        for (const input of [walletId, memo]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        const lnInvoice = await _app_1.Wallets.addInvoiceNoAmountForSelf({
            walletId,
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
exports.default = LnNoAmountInvoiceCreateMutation;
//# sourceMappingURL=ln-noamount-invoice-create.js.map