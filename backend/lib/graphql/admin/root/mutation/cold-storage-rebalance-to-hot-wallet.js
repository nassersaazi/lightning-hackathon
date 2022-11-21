"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const psbt_detail_1 = __importDefault(require("../../types/payload/psbt-detail"));
const _app_1 = require("../../../../app/index");
const error_map_1 = require("../../../error-map");
const sat_amount_1 = __importDefault(require("../../../types/scalar/sat-amount"));
const target_confirmations_1 = __importDefault(require("../../../types/scalar/target-confirmations"));
const ColdStorageRebalanceToHotWalletInput = index_1.GT.Input({
    name: "ColdStorageRebalanceToHotWalletInput",
    fields: () => ({
        walletName: { type: index_1.GT.NonNull(index_1.GT.String) },
        amount: { type: index_1.GT.NonNull(sat_amount_1.default) },
        targetConfirmations: { type: target_confirmations_1.default, defaultValue: 1 },
    }),
});
const ColdStorageRebalanceToHotWalletMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(psbt_detail_1.default),
    args: {
        input: { type: index_1.GT.NonNull(ColdStorageRebalanceToHotWalletInput) },
    },
    resolve: async (_, args) => {
        const { walletName, amount, targetConfirmations } = args.input;
        for (const input of [walletName, amount, targetConfirmations]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        const result = await _app_1.ColdStorage.rebalanceToHotWallet({
            walletName,
            amount,
            targetConfirmations,
        });
        if (result instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(result)] };
        }
        return { errors: [], psbtDetail: result };
    },
});
exports.default = ColdStorageRebalanceToHotWalletMutation;
//# sourceMappingURL=cold-storage-rebalance-to-hot-wallet.js.map