"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const _app_1 = require("../../../../app/index");
const error_map_1 = require("../../../error-map");
const shared_1 = require("../../../../domain/shared");
const wallets_1 = require("../../../../domain/wallets");
const wallet_details_1 = __importDefault(require("../../types/payload/wallet-details"));
const AccountsAddUsdWalletInput = index_1.GT.Input({
    name: "AccountsAddUsdWalletInput",
    fields: () => ({
        accountIds: {
            type: index_1.GT.NonNullList(index_1.GT.ID),
        },
    }),
});
const AccountsAddUsdWalletMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: wallet_details_1.default,
    args: {
        input: { type: index_1.GT.NonNull(AccountsAddUsdWalletInput) },
    },
    resolve: async (_, args) => {
        const { accountIds } = args.input;
        if (accountIds instanceof Error) {
            return [{ errors: [{ message: accountIds.message }] }];
        }
        const addWalletResults = await Promise.all(accountIds.map((accountId) => _app_1.Accounts.addWalletIfNonexistent({
            accountId: accountId,
            type: wallets_1.WalletType.Checking,
            currency: shared_1.WalletCurrency.Usd,
        })));
        const errors = [];
        const walletDetails = [];
        addWalletResults.forEach((wallet) => {
            if (wallet instanceof Error) {
                return errors.push((0, error_map_1.mapAndParseErrorForGqlResponse)(wallet));
            }
            walletDetails.push(wallet);
        });
        return { errors, walletDetails };
    },
});
exports.default = AccountsAddUsdWalletMutation;
//# sourceMappingURL=account-add-usd-wallet.js.map