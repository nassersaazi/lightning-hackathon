"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithEmail = exports.loginWithPhone = void 0;
const create_account_1 = require("../accounts/create-account");
const _config_1 = require("../../config/index");
const accounts_1 = require("../../domain/accounts");
const test_accounts_checker_1 = require("../../domain/accounts/test-accounts-checker");
const errors_1 = require("../../domain/authentication/errors");
const errors_2 = require("../../domain/errors");
const rate_limit_1 = require("../../domain/rate-limit");
const shared_1 = require("../../domain/shared");
const users_1 = require("../../domain/users");
const kratos_1 = require("../../services/kratos");
const mongoose_1 = require("../../services/mongoose");
const phone_code_1 = require("../../services/mongoose/phone-code");
const rate_limit_2 = require("../../services/rate-limit");
const tracing_1 = require("../../services/tracing");
const loginWithPhone = async ({ phone, code, logger, ip, }) => {
    const subLogger = logger.child({ topic: "login" });
    {
        const limitOk = await checkFailedLoginAttemptPerIpLimits(ip);
        if (limitOk instanceof Error)
            return limitOk;
    }
    {
        const limitOk = await checkFailedLoginAttemptPerPhoneLimits(phone);
        if (limitOk instanceof Error)
            return limitOk;
    }
    // TODO:
    // add fibonachi on failed login
    // https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#dynamic-block-duration
    const age = _config_1.MAX_AGE_TIME_CODE;
    const validCode = await isCodeValid({ phone, code, age });
    if (validCode instanceof Error)
        return validCode;
    await rewardFailedLoginAttemptPerIpLimits(ip);
    await rewardFailedLoginAttemptPerPhoneLimits(phone);
    let kratosToken;
    let kratosUserId;
    const authService = (0, kratos_1.AuthWithPhonePasswordlessService)();
    let kratosResult = await authService.login(phone);
    if (kratosResult instanceof errors_1.LikelyNoUserWithThisPhoneExistError) {
        // user has not migrated to kratos or it's a new user
        kratosResult = await authService.createIdentityWithSession(phone);
        if (kratosResult instanceof Error)
            return kratosResult;
        (0, tracing_1.addAttributesToCurrentSpan)({ "login.newAccount": true });
        kratosToken = kratosResult.sessionToken;
        kratosUserId = kratosResult.kratosUserId;
        const user = await (0, mongoose_1.UsersRepository)().findByPhone(phone);
        if (user instanceof errors_2.CouldNotFindUserFromPhoneError) {
            // brand new user
            subLogger.info({ phone }, "new user signup");
            // TODO: look at where is phone metadata stored
            const accountRaw = { kratosUserId, phone };
            const account = await (0, create_account_1.createAccountWithPhoneIdentifier)({
                newAccountInfo: accountRaw,
                config: (0, _config_1.getDefaultAccountsConfig)(),
            });
            if (account instanceof Error)
                return account;
        }
        else if (user instanceof Error) {
            return user;
        }
        else {
            // account exist but doesn't have a kratos user yet
            let account = await (0, mongoose_1.AccountsRepository)().findByUserId(user.id);
            if (account instanceof Error)
                return account;
            account = await (0, mongoose_1.AccountsRepository)().update({
                ...account,
                kratosUserId,
            });
            if (account instanceof Error) {
                (0, tracing_1.recordExceptionInCurrentSpan)({
                    error: `error with attachKratosUser login: ${account}`,
                    level: shared_1.ErrorLevel.Critical,
                    attributes: { kratosUserId, id: user.id, phone },
                });
            }
        }
    }
    else if (kratosResult instanceof Error) {
        return kratosResult;
    }
    else {
        kratosToken = kratosResult.sessionToken;
        kratosUserId = kratosResult.kratosUserId;
    }
    return kratosToken;
};
exports.loginWithPhone = loginWithPhone;
const loginWithEmail = async ({ kratosUserId, emailAddress, logger, ip, }) => {
    const kratosUserIdValid = (0, accounts_1.checkedToKratosUserId)(kratosUserId);
    if (kratosUserIdValid instanceof Error)
        return kratosUserIdValid;
    const emailAddressValid = (0, users_1.checkedToEmailAddress)(emailAddress);
    if (emailAddressValid instanceof Error)
        return emailAddressValid;
    const subLogger = logger.child({ topic: "login" });
    {
        const limitOk = await checkFailedLoginAttemptPerIpLimits(ip);
        if (limitOk instanceof Error)
            return limitOk;
    }
    {
        const limitOk = await checkfailedLoginAttemptPerEmailAddressLimits(emailAddressValid);
        if (limitOk instanceof Error)
            return limitOk;
    }
    let account = await (0, mongoose_1.AccountsRepository)().findByKratosUserId(kratosUserIdValid);
    if (account instanceof errors_2.CouldNotFindAccountFromKratosIdError) {
        subLogger.info({ kratosUserId }, "New Kratos user signup");
        (0, tracing_1.addAttributesToCurrentSpan)({ "login.newAccount": true });
        account = await (0, create_account_1.createAccountForEmailIdentifier)({
            kratosUserId: kratosUserIdValid,
            config: (0, _config_1.getDefaultAccountsConfig)(),
        });
    }
    if (account instanceof Error)
        return account;
    return {
        accountStatus: account.status.toUpperCase(),
    };
};
exports.loginWithEmail = loginWithEmail;
const checkFailedLoginAttemptPerIpLimits = async (ip) => (0, rate_limit_2.consumeLimiter)({
    rateLimitConfig: rate_limit_1.RateLimitConfig.failedLoginAttemptPerIp,
    keyToConsume: ip,
});
const rewardFailedLoginAttemptPerIpLimits = async (ip) => {
    const limiter = (0, rate_limit_2.RedisRateLimitService)({
        keyPrefix: rate_limit_1.RateLimitPrefix.failedLoginAttemptPerIp,
        limitOptions: (0, _config_1.getFailedLoginAttemptPerIpLimits)(),
    });
    return limiter.reward(ip);
};
const checkFailedLoginAttemptPerPhoneLimits = async (phone) => (0, rate_limit_2.consumeLimiter)({
    rateLimitConfig: rate_limit_1.RateLimitConfig.failedLoginAttemptPerPhone,
    keyToConsume: phone,
});
const rewardFailedLoginAttemptPerPhoneLimits = async (phone) => {
    const limiter = (0, rate_limit_2.RedisRateLimitService)({
        keyPrefix: rate_limit_1.RateLimitPrefix.failedLoginAttemptPerPhone,
        limitOptions: (0, _config_1.getFailedLoginAttemptPerPhoneLimits)(),
    });
    return limiter.reward(phone);
};
const checkfailedLoginAttemptPerEmailAddressLimits = async (emailAddress) => (0, rate_limit_2.consumeLimiter)({
    rateLimitConfig: rate_limit_1.RateLimitConfig.failedLoginAttemptPerEmailAddress,
    keyToConsume: emailAddress,
});
const isCodeValid = async ({ code, phone, age, }) => {
    const testAccounts = (0, _config_1.getTestAccounts)();
    const validTestCode = (0, test_accounts_checker_1.TestAccountsChecker)(testAccounts).isPhoneAndCodeValid({
        code,
        phone,
    });
    if (validTestCode)
        return true;
    return (0, phone_code_1.PhoneCodesRepository)().existNewerThan({ code, phone, age });
};
//# sourceMappingURL=login.js.map