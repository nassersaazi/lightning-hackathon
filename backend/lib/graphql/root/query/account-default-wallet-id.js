"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_map_1 = require("../../error-map");
const index_1 = require("../../index");
const username_1 = __importDefault(require("../../types/scalar/username"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const mongoose_1 = require("../../../services/mongoose");
const AccountDefaultWalletIdQuery = index_1.GT.Field({
    deprecationReason: "will be migrated to AccountDefaultWalletId",
    type: index_1.GT.NonNull(wallet_id_1.default),
    args: {
        username: {
            type: index_1.GT.NonNull(username_1.default),
        },
    },
    resolve: async (_, args) => {
        const { username } = args;
        if (username instanceof Error) {
            throw username;
        }
        const account = await (0, mongoose_1.AccountsRepository)().findByUsername(username);
        if (account instanceof Error) {
            throw (0, error_map_1.mapError)(account);
        }
        const walletId = account.defaultWalletId;
        return walletId;
    },
});
exports.default = AccountDefaultWalletIdQuery;
//# sourceMappingURL=account-default-wallet-id.js.map