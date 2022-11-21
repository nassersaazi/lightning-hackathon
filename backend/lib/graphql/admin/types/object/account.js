"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../../app/index");
const index_1 = require("../../../index");
const coordinates_1 = __importDefault(require("../../../types/object/coordinates"));
const timestamp_1 = __importDefault(require("../../../types/scalar/timestamp"));
const username_1 = __importDefault(require("../../../types/scalar/username"));
const wallet_1 = __importDefault(require("../../../types/abstract/wallet"));
const account_level_1 = __importDefault(require("../scalar/account-level"));
const account_status_1 = __importDefault(require("../scalar/account-status"));
const user_1 = __importDefault(require("./user"));
const Account = index_1.GT.Object({
    name: "Account",
    description: "Accounts are core to the Galoy architecture. they have users, and own wallets",
    fields: () => ({
        id: { type: index_1.GT.NonNullID },
        username: { type: username_1.default },
        level: { type: index_1.GT.NonNull(account_level_1.default) },
        status: { type: index_1.GT.NonNull(account_status_1.default) },
        title: { type: index_1.GT.String },
        wallets: {
            type: index_1.GT.NonNullList(wallet_1.default),
            resolve: async (source) => {
                return _app_1.Wallets.listWalletsByAccountId(source.id);
            },
        },
        owner: {
            // should be used for individual account only,
            // ie: when there are no multiple users
            // probably separating AccountDetail to DetailConsumerAccount
            // with DetailCorporateAccount is a way to have owner only in DetailConsumerAccount
            // and users: [Users] in DetailCorporateAccount
            type: index_1.GT.NonNull(user_1.default),
            resolve: async (source) => {
                const user = await _app_1.Users.getUser(source.ownerId);
                if (user instanceof Error) {
                    throw user;
                }
                return user;
            },
        },
        coordinates: {
            type: coordinates_1.default,
            description: "GPS coordinates for the account that can be used to place the related business on a map",
        },
        createdAt: {
            type: index_1.GT.NonNull(timestamp_1.default),
            resolve: (source) => source.createdAt,
        },
    }),
});
exports.default = Account;
//# sourceMappingURL=account.js.map