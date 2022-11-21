"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dedent_1 = __importDefault(require("dedent"));
const index_1 = require("../../index");
const wallets_1 = require("../../../domain/wallets");
const wallet_id_1 = __importDefault(require("../scalar/wallet-id"));
const username_1 = __importDefault(require("../scalar/username"));
const onchain_tx_hash_1 = __importDefault(require("../scalar/onchain-tx-hash"));
const ln_payment_preimage_1 = __importDefault(require("../scalar/ln-payment-preimage"));
const ln_payment_secret_1 = __importDefault(require("../scalar/ln-payment-secret"));
const SettlementViaIntraLedger = index_1.GT.Object({
    name: "SettlementViaIntraLedger",
    isTypeOf: (source) => source.type === wallets_1.SettlementMethod.IntraLedger,
    fields: () => ({
        counterPartyWalletId: {
            // type: GT.NonNull(WalletId),
            type: wallet_id_1.default,
        },
        counterPartyUsername: {
            type: username_1.default,
            description: (0, dedent_1.default) `Settlement destination: Could be null if the payee does not have a username`,
        },
    }),
});
const SettlementViaLn = index_1.GT.Object({
    name: "SettlementViaLn",
    isTypeOf: (source) => source.type === wallets_1.SettlementMethod.Lightning,
    fields: () => ({
        paymentSecret: {
            type: ln_payment_secret_1.default,
            resolve: (source) => source.revealedPreImage,
            deprecationReason: "Shifting property to 'preImage' to improve granularity of the LnPaymentSecret type",
        },
        preImage: {
            type: ln_payment_preimage_1.default,
            resolve: (source) => source.revealedPreImage,
        },
    }),
});
const SettlementViaOnChain = index_1.GT.Object({
    name: "SettlementViaOnChain",
    isTypeOf: (source) => source.type === wallets_1.SettlementMethod.OnChain,
    fields: () => ({
        transactionHash: {
            type: index_1.GT.NonNull(onchain_tx_hash_1.default),
        },
    }),
});
const SettlementVia = index_1.GT.Union({
    name: "SettlementVia",
    types: () => [SettlementViaIntraLedger, SettlementViaLn, SettlementViaOnChain],
});
exports.default = SettlementVia;
//# sourceMappingURL=settlement-via.js.map