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
const CaptchaRequestAuthCodeInput = index_1.GT.Input({
    name: "CaptchaRequestAuthCodeInput",
    fields: () => ({
        phone: { type: index_1.GT.NonNull(phone_1.default) },
        challengeCode: { type: index_1.GT.NonNull(index_1.GT.String) },
        validationCode: { type: index_1.GT.NonNull(index_1.GT.String) },
        secCode: { type: index_1.GT.NonNull(index_1.GT.String) },
    }),
});
const CaptchaRequestAuthCodeMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(success_payload_1.default),
    args: {
        input: { type: index_1.GT.NonNull(CaptchaRequestAuthCodeInput) },
    },
    resolve: async (_, args, { logger, ip, geetest }) => {
        const { phone, challengeCode: geetestChallenge, validationCode: geetestValidate, secCode: geetestSeccode, } = args.input;
        for (const input of [phone, geetestChallenge, geetestValidate, geetestSeccode]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        if (ip === undefined) {
            return { errors: [{ message: "ip is undefined" }] };
        }
        const result = await _app_1.Users.requestPhoneCodeWithCaptcha({
            phone,
            geetest,
            geetestChallenge,
            geetestValidate,
            geetestSeccode,
            logger,
            ip,
        });
        if (result instanceof Error) {
            return {
                errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(result)],
                success: false,
            };
        }
        return {
            errors: [],
            success: true,
        };
    },
});
exports.default = CaptchaRequestAuthCodeMutation;
//# sourceMappingURL=captcha-request-auth-code.js.map