"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const _app_1 = require("../../../../app/index");
const payment_hash_1 = __importDefault(require("../../../types/scalar/payment-hash"));
const lightning_invoice_1 = __importDefault(require("../../types/object/lightning-invoice"));
const LightningInvoiceQuery = index_1.GT.Field({
    type: index_1.GT.NonNull(lightning_invoice_1.default),
    args: {
        hash: { type: index_1.GT.NonNull(payment_hash_1.default) },
    },
    resolve: async (_, { hash }) => {
        if (hash instanceof Error)
            throw hash;
        const lightningInvoice = await _app_1.Lightning.lookupInvoiceByHash(hash);
        if (lightningInvoice instanceof Error)
            throw lightningInvoice;
        return lightningInvoice;
    },
});
exports.default = LightningInvoiceQuery;
//# sourceMappingURL=lightning-invoice.js.map