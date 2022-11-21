"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const CaptchaCreateChallengeResult = index_1.GT.Object({
    name: "CaptchaCreateChallengeResult",
    fields: () => ({
        id: {
            type: index_1.GT.NonNull(index_1.GT.String),
        },
        challengeCode: {
            type: index_1.GT.NonNull(index_1.GT.String),
        },
        newCaptcha: {
            type: index_1.GT.NonNull(index_1.GT.Boolean),
        },
        failbackMode: {
            type: index_1.GT.NonNull(index_1.GT.Boolean),
        },
    }),
});
const CaptchaCreateChallengePayload = index_1.GT.Object({
    name: "CaptchaCreateChallengePayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        result: { type: CaptchaCreateChallengeResult },
    }),
});
exports.default = CaptchaCreateChallengePayload;
//# sourceMappingURL=captcha-create-challenge.js.map