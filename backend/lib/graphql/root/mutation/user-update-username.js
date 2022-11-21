"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const accounts_1 = require("../../../domain/accounts");
const error_map_1 = require("../../error-map");
const index_1 = require("../../index");
const user_update_username_1 = __importDefault(require("../../types/payload/user-update-username"));
const username_1 = __importDefault(require("../../types/scalar/username"));
const UserUpdateUsernameInput = index_1.GT.Input({
    name: "UserUpdateUsernameInput",
    fields: () => ({
        username: { type: index_1.GT.NonNull(username_1.default) },
    }),
});
const UserUpdateUsernameMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(user_update_username_1.default),
    args: {
        input: { type: index_1.GT.NonNull(UserUpdateUsernameInput) },
    },
    deprecationReason: "Username will be moved to @Handle in Accounts. Also SetUsername should be used instead of UpdateUsername to reflect the idempotency of Handles",
    resolve: async (_, args, { domainAccount, domainUser }) => {
        const { username } = args.input;
        if (username instanceof Error) {
            return { errors: [{ message: username.message }] };
        }
        const result = await _app_1.Accounts.setUsername({ username, id: domainAccount.id });
        if (result instanceof Error) {
            return {
                errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(result)],
                ...(result instanceof accounts_1.UsernameIsImmutableError ? { user: domainUser } : {}),
            };
        }
        return {
            errors: [],
            // TODO: move to accounts
            // TODO: username and id are not populated correctly (but those properties not been used currently by a client)
            user: result,
        };
    },
});
exports.default = UserUpdateUsernameMutation;
//# sourceMappingURL=user-update-username.js.map