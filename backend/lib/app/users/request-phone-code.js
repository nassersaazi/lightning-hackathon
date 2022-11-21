"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPhoneCode = exports.requestPhoneCodeWithCaptcha = void 0;
const crypto_1 = require("crypto");
const _config_1 = require("../../config/index");
const test_accounts_checker_1 = require("../../domain/accounts/test-accounts-checker");
const rate_limit_1 = require("../../domain/rate-limit");
const phone_code_1 = require("../../services/mongoose/phone-code");
const rate_limit_2 = require("../../services/rate-limit");
const twilio_1 = require("../../services/twilio");
const requestPhoneCodeWithCaptcha = async ({ phone, geetest, geetestChallenge, geetestValidate, geetestSeccode, logger, ip, }) => {
    logger.info({ phone, ip }, "RequestPhoneCodeGeetest called");
    const verifySuccess = await geetest.validate(geetestChallenge, geetestValidate, geetestSeccode);
    if (verifySuccess instanceof Error)
        return verifySuccess;
    return (0, exports.requestPhoneCode)({
        phone,
        logger,
        ip,
    });
};
exports.requestPhoneCodeWithCaptcha = requestPhoneCodeWithCaptcha;
const requestPhoneCode = async ({ phone, logger, ip, }) => {
    logger.info({ phone, ip }, "RequestPhoneCode called");
    {
        const limitOk = await checkPhoneCodeAttemptPerIpLimits(ip);
        if (limitOk instanceof Error)
            return limitOk;
    }
    {
        const limitOk = await checkPhoneCodeAttemptPerPhoneLimits(phone);
        if (limitOk instanceof Error)
            return limitOk;
    }
    {
        const limitOk = await checkPhoneCodeAttemptPerPhoneMinIntervalLimits(phone);
        if (limitOk instanceof Error)
            return limitOk;
    }
    const testAccounts = (0, _config_1.getTestAccounts)();
    if ((0, test_accounts_checker_1.TestAccountsChecker)(testAccounts).isPhoneValid(phone)) {
        return true;
    }
    const code = String((0, crypto_1.randomInt)(100000, 999999));
    const galoyInstanceName = (0, _config_1.getGaloyInstanceName)();
    const body = `${code} is your verification code for ${galoyInstanceName}`;
    const result = await (0, phone_code_1.PhoneCodesRepository)().persistNew({
        phone,
        code,
    });
    if (result instanceof Error)
        return result;
    const sendTextArguments = { body, to: phone, logger };
    return (0, twilio_1.TwilioClient)().sendText(sendTextArguments);
};
exports.requestPhoneCode = requestPhoneCode;
const checkPhoneCodeAttemptPerIpLimits = async (ip) => (0, rate_limit_2.consumeLimiter)({
    rateLimitConfig: rate_limit_1.RateLimitConfig.requestPhoneCodeAttemptPerIp,
    keyToConsume: ip,
});
const checkPhoneCodeAttemptPerPhoneLimits = async (phone) => (0, rate_limit_2.consumeLimiter)({
    rateLimitConfig: rate_limit_1.RateLimitConfig.requestPhoneCodeAttemptPerPhone,
    keyToConsume: phone,
});
const checkPhoneCodeAttemptPerPhoneMinIntervalLimits = async (phone) => (0, rate_limit_2.consumeLimiter)({
    rateLimitConfig: rate_limit_1.RateLimitConfig.requestPhoneCodeAttemptPerPhoneMinInterval,
    keyToConsume: phone,
});
//# sourceMappingURL=request-phone-code.js.map