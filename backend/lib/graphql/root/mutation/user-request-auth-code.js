"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const phone_1 = __importDefault(require("../../types/scalar/phone"));
const success_payload_1 = __importDefault(require("../../types/payload/success-payload"));
const _app_1 = require("../../../app/index");
const error_map_1 = require("../../error-map");
const _config_1 = require("../../../config/index");
const UserRequestAuthCodeInput = index_1.GT.Input({
    name: "UserRequestAuthCodeInput",
    fields: () => ({
        phone: {
            type: index_1.GT.NonNull(phone_1.default),
        },
    }),
});
const UserRequestAuthCodeMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(success_payload_1.default),
    args: {
        input: { type: index_1.GT.NonNull(UserRequestAuthCodeInput) },
    },
    resolve: async (_, args, { logger, ip }) => {
        const isCaptchaMandatory = (0, _config_1.getCaptcha)().mandatory;
        if (isCaptchaMandatory) {
            return { errors: [{ message: "use captcha endpoint to request auth code" }] };
        }
        const { phone } = args.input;
        if (phone instanceof Error) {
            return { errors: [{ message: phone.message }] };
        }
        if (ip === undefined) {
            return { errors: [{ message: "ip is undefined" }] };
        }
        const status = await _app_1.Users.requestPhoneCode({ phone, logger, ip });
        if (status instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(status)] };
        }
        return { errors: [], success: status };
    },
});
exports.default = UserRequestAuthCodeMutation;
//# sourceMappingURL=user-request-auth-code.js.map