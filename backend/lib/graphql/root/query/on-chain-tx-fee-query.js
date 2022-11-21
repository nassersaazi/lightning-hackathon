"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const _app_1 = require("../../../app/index");
const error_map_1 = require("../../error-map");
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const sat_amount_1 = __importDefault(require("../../types/scalar/sat-amount"));
const onchain_tx_fee_1 = __importDefault(require("../../types/object/onchain-tx-fee"));
const on_chain_address_1 = __importDefault(require("../../types/scalar/on-chain-address"));
const target_confirmations_1 = __importDefault(require("../../types/scalar/target-confirmations"));
const helpers_1 = require("../../helpers");
const OnChainTxFeeQuery = index_1.GT.Field({
    type: index_1.GT.NonNull(onchain_tx_fee_1.default),
    args: {
        walletId: { type: index_1.GT.NonNull(wallet_id_1.default) },
        address: { type: index_1.GT.NonNull(on_chain_address_1.default) },
        amount: { type: index_1.GT.NonNull(sat_amount_1.default) },
        targetConfirmations: { type: target_confirmations_1.default, defaultValue: 1 },
    },
    resolve: async (_, args, { domainAccount }) => {
        const { walletId, address, amount, targetConfirmations } = args;
        for (const input of [walletId, address, amount, targetConfirmations]) {
            if (input instanceof Error)
                throw input;
        }
        const btcWalletValidated = await (0, helpers_1.validateIsBtcWalletForMutation)(walletId);
        if (btcWalletValidated != true)
            return btcWalletValidated;
        const fee = await _app_1.Wallets.getOnChainFee({
            walletId,
            account: domainAccount,
            amount,
            address,
            targetConfirmations,
        });
        if (fee instanceof Error)
            throw (0, error_map_1.mapError)(fee);
        return {
            amount: fee,
            targetConfirmations,
        };
    },
});
exports.default = OnChainTxFeeQuery;
//# sourceMappingURL=on-chain-tx-fee-query.js.map