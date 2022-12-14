"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const memo_1 = __importDefault(require("../../types/scalar/memo"));
const error_map_1 = require("../../error-map");
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const sat_amount_1 = __importDefault(require("../../types/scalar/sat-amount"));
const on_chain_address_1 = __importDefault(require("../../types/scalar/on-chain-address"));
const payment_send_1 = __importDefault(require("../../types/payload/payment-send"));
const target_confirmations_1 = __importDefault(require("../../types/scalar/target-confirmations"));
const helpers_1 = require("../../helpers");
const _app_1 = require("../../../app/index");
const OnChainPaymentSendInput = index_1.GT.Input({
    name: "OnChainPaymentSendInput",
    fields: () => ({
        walletId: { type: index_1.GT.NonNull(wallet_id_1.default) },
        address: { type: index_1.GT.NonNull(on_chain_address_1.default) },
        amount: { type: index_1.GT.NonNull(sat_amount_1.default) },
        memo: { type: memo_1.default },
        targetConfirmations: { type: target_confirmations_1.default, defaultValue: 1 },
    }),
});
const OnChainPaymentSendMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(payment_send_1.default),
    args: {
        input: { type: index_1.GT.NonNull(OnChainPaymentSendInput) },
    },
    resolve: async (_, args, { domainAccount }) => {
        const { walletId, address, amount, memo, targetConfirmations } = args.input;
        if (walletId instanceof Error) {
            return { errors: [{ message: walletId.message }] };
        }
        if (address instanceof Error) {
            return { errors: [{ message: address.message }] };
        }
        if (memo instanceof Error) {
            return { errors: [{ message: memo.message }] };
        }
        if (targetConfirmations instanceof Error) {
            return { errors: [{ message: targetConfirmations.message }] };
        }
        const btcWalletValidated = await (0, helpers_1.validateIsBtcWalletForMutation)(walletId);
        if (btcWalletValidated != true)
            return btcWalletValidated;
        const status = await _app_1.Wallets.payOnChainByWalletId({
            senderAccount: domainAccount,
            senderWalletId: walletId,
            amount,
            address,
            targetConfirmations,
            memo,
            sendAll: false,
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
exports.default = OnChainPaymentSendMutation;
//# sourceMappingURL=onchain-payment-send.js.map