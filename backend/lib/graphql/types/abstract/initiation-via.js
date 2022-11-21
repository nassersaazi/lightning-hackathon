"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const wallets_1 = require("../../../domain/wallets");
const wallet_id_1 = __importDefault(require("../scalar/wallet-id"));
const username_1 = __importDefault(require("../scalar/username"));
const on_chain_address_1 = __importDefault(require("../scalar/on-chain-address"));
const payment_hash_1 = __importDefault(require("../scalar/payment-hash"));
const InitiationViaIntraLedger = index_1.GT.Object({
    name: "InitiationViaIntraLedger",
    isTypeOf: (source) => source.type === wallets_1.PaymentInitiationMethod.IntraLedger,
    fields: () => ({
        counterPartyWalletId: {
            // type: GT.NonNull(WalletId),
            type: wallet_id_1.default,
        },
        counterPartyUsername: {
            type: username_1.default,
        },
    }),
});
const InitiationViaLn = index_1.GT.Object({
    name: "InitiationViaLn",
    isTypeOf: (source) => source.type === wallets_1.PaymentInitiationMethod.Lightning,
    fields: () => ({
        paymentHash: {
            type: index_1.GT.NonNull(payment_hash_1.default),
        },
    }),
});
const InitiationViaOnChain = index_1.GT.Object({
    name: "InitiationViaOnChain",
    isTypeOf: (source) => source.type === wallets_1.PaymentInitiationMethod.OnChain,
    fields: () => ({
        address: {
            type: index_1.GT.NonNull(on_chain_address_1.default),
        },
    }),
});
const InitiationVia = index_1.GT.Union({
    name: "InitiationVia",
    types: () => [InitiationViaIntraLedger, InitiationViaLn, InitiationViaOnChain],
});
exports.default = InitiationVia;
//# sourceMappingURL=initiation-via.js.map