"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const captcha_create_challenge_1 = __importDefault(require("../../types/payload/captcha-create-challenge"));
const CaptchaCreateChallengeMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(captcha_create_challenge_1.default),
    resolve: async (_, __, { geetest }) => {
        // TODO: store the request and determine what to do if things fail here...
        const registerCaptchaGeetest = await geetest.register();
        if (registerCaptchaGeetest instanceof Error) {
            return {
                errors: [{ message: registerCaptchaGeetest.message }],
            };
        }
        const { success, gt, challenge, newCaptcha } = registerCaptchaGeetest;
        return {
            errors: [],
            result: {
                id: gt,
                challengeCode: challenge,
                newCaptcha,
                failbackMode: success === 0,
            },
        };
    },
});
exports.default = CaptchaCreateChallengeMutation;
//# sourceMappingURL=captcha-create-challenge.js.map