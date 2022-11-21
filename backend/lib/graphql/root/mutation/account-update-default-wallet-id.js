"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const error_map_1 = require("../../error-map");
const index_1 = require("../../index");
const account_update_default_wallet_id_1 = __importDefault(require("../../types/payload/account-update-default-wallet-id"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const AccountUpdateDefaultWalletIdInput = index_1.GT.Input({
    name: "AccountUpdateDefaultWalletIdInput",
    fields: () => ({
        walletId: { type: index_1.GT.NonNull(wallet_id_1.default) },
    }),
});
const AccountUpdateDefaultWalletIdMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(account_update_default_wallet_id_1.default),
    args: {
        input: { type: index_1.GT.NonNull(AccountUpdateDefaultWalletIdInput) },
    },
    resolve: async (_, args, { domainAccount }) => {
        const { walletId } = args.input;
        if (walletId instanceof Error) {
            return { errors: [{ message: walletId.message }] };
        }
        const result = await _app_1.Accounts.updateDefaultWalletId({
            walletId,
            accountId: domainAccount.id,
        });
        if (result instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(result)] };
        }
        return {
            errors: [],
            account: result,
        };
    },
});
exports.default = AccountUpdateDefaultWalletIdMutation;
//# sourceMappingURL=account-update-default-wallet-id.js.map