"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const one_time_auth_code_1 = __importDefault(require("../../types/scalar/one-time-auth-code"));
const phone_1 = __importDefault(require("../../types/scalar/phone"));
const auth_token_1 = __importDefault(require("../../types/payload/auth-token"));
const _app_1 = require("../../../app/index");
const error_map_1 = require("../../error-map");
const UserLoginInput = index_1.GT.Input({
    name: "UserLoginInput",
    fields: () => ({
        phone: {
            type: index_1.GT.NonNull(phone_1.default),
        },
        code: {
            type: index_1.GT.NonNull(one_time_auth_code_1.default),
        },
    }),
});
const UserLoginMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(auth_token_1.default),
    args: {
        input: { type: index_1.GT.NonNull(UserLoginInput) },
    },
    resolve: async (_, args, { logger, ip }) => {
        const { phone, code } = args.input;
        if (phone instanceof Error) {
            return { errors: [{ message: phone.message }] };
        }
        if (code instanceof Error) {
            return { errors: [{ message: code.message }] };
        }
        if (ip === undefined) {
            return { errors: [{ message: "ip is undefined" }] };
        }
        const authToken = await _app_1.Users.loginWithPhone({ phone, code, logger, ip });
        if (authToken instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(authToken)] };
        }
        return { errors: [], authToken };
    },
});
exports.default = UserLoginMutation;
//# sourceMappingURL=user-login.js.map