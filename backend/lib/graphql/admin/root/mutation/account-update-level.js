"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../../app/index");
const account_detail_1 = __importDefault(require("../../types/payload/account-detail"));
const account_level_1 = __importDefault(require("../../types/scalar/account-level"));
const error_map_1 = require("../../../error-map");
const index_1 = require("../../../index");
const AccountUpdateLevelInput = index_1.GT.Input({
    name: "AccountUpdateLevelInput",
    fields: () => ({
        // FIXME: should be account id
        uid: {
            type: index_1.GT.NonNullID,
        },
        level: {
            type: index_1.GT.NonNull(account_level_1.default),
        },
    }),
});
const AccountUpdateLevelMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(account_detail_1.default),
    args: {
        input: { type: index_1.GT.NonNull(AccountUpdateLevelInput) },
    },
    resolve: async (_, args) => {
        // FIXME: should be account id
        const { uid, level } = args.input;
        for (const input of [uid, level]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        if (level instanceof Error)
            return { errors: [{ message: level.message }] };
        const account = await _app_1.Accounts.updateAccountLevel({ id: uid, level });
        if (account instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(account)] };
        }
        return { errors: [], accountDetails: account };
    },
});
exports.default = AccountUpdateLevelMutation;
//# sourceMappingURL=account-update-level.js.map