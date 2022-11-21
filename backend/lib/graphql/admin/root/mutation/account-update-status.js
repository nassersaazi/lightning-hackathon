"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const account_detail_1 = __importDefault(require("../../types/payload/account-detail"));
const account_status_1 = __importDefault(require("../../types/scalar/account-status"));
const _app_1 = require("../../../../app/index");
const error_map_1 = require("../../../error-map");
const AccountUpdateStatusInput = index_1.GT.Input({
    name: "AccountUpdateStatusInput",
    fields: () => ({
        uid: {
            type: index_1.GT.NonNullID,
        },
        status: {
            type: index_1.GT.NonNull(account_status_1.default),
        },
        comment: {
            type: index_1.GT.String,
        },
    }),
});
const AccountUpdateStatusMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(account_detail_1.default),
    args: {
        input: { type: index_1.GT.NonNull(AccountUpdateStatusInput) },
    },
    resolve: async (_, args, { domainUser }) => {
        const { uid, status, comment } = args.input;
        for (const input of [uid, status, comment]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        if (status instanceof Error)
            return { errors: [{ message: status.message }] };
        const account = await _app_1.Accounts.updateAccountStatus({
            id: uid,
            status,
            updatedByUserId: domainUser.id,
            comment,
        });
        if (account instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(account)] };
        }
        return { errors: [], accountDetails: account };
    },
});
exports.default = AccountUpdateStatusMutation;
//# sourceMappingURL=account-update-status.js.map