"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const _app_1 = require("../../../app/index");
const on_chain_address_1 = __importDefault(require("../../types/payload/on-chain-address"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const error_map_1 = require("../../error-map");
const helpers_1 = require("../../helpers");
const OnChainAddressCreateInput = index_1.GT.Input({
    name: "OnChainAddressCreateInput",
    fields: () => ({
        walletId: { type: index_1.GT.NonNull(wallet_id_1.default) },
    }),
});
const OnChainAddressCreateMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(on_chain_address_1.default),
    args: {
        input: { type: index_1.GT.NonNull(OnChainAddressCreateInput) },
    },
    resolve: async (_, args) => {
        const { walletId } = args.input;
        if (walletId instanceof Error) {
            return { errors: [{ message: walletId.message }] };
        }
        const btcWalletValidated = await (0, helpers_1.validateIsBtcWalletForMutation)(walletId);
        if (btcWalletValidated != true)
            return btcWalletValidated;
        const address = await _app_1.Wallets.createOnChainAddress(walletId);
        if (address instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(address)] };
        }
        return {
            errors: [],
            address,
        };
    },
});
exports.default = OnChainAddressCreateMutation;
//# sourceMappingURL=on-chain-address-create.js.map