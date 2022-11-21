"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitConfig = exports.RateLimitPrefix = void 0;
const _config_1 = require("../../config/index");
const errors_1 = require("./errors");
exports.RateLimitPrefix = {
    requestPhoneCodeAttemptPerPhone: "phone_code_attempt_phone_code",
    requestPhoneCodeAttemptPerPhoneMinInterval: "phone_code_attempt_phone_code_min_interval",
    requestPhoneCodeAttemptPerIp: "phone_code_attempt_ip",
    failedLoginAttemptPerPhone: "login_attempt_phone",
    failedLoginAttemptPerEmailAddress: "login_attempt_email",
    failedLoginAttemptPerIp: "login_attempt_ip",
    invoiceCreate: "invoice_create",
    invoiceCreateForRecipient: "invoice_create_for_recipient",
    onChainAddressCreate: "onchain_address_create",
};
exports.RateLimitConfig = {
    requestPhoneCodeAttemptPerPhone: {
        key: exports.RateLimitPrefix.requestPhoneCodeAttemptPerPhone,
        limits: (0, _config_1.getRequestPhoneCodePerPhoneLimits)(),
        error: errors_1.UserPhoneCodeAttemptPhoneRateLimiterExceededError,
    },
    requestPhoneCodeAttemptPerPhoneMinInterval: {
        key: exports.RateLimitPrefix.requestPhoneCodeAttemptPerPhoneMinInterval,
        limits: (0, _config_1.getRequestPhoneCodePerPhoneMinIntervalLimits)(),
        error: errors_1.UserPhoneCodeAttemptPhoneMinIntervalRateLimiterExceededError,
    },
    requestPhoneCodeAttemptPerIp: {
        key: exports.RateLimitPrefix.requestPhoneCodeAttemptPerIp,
        limits: (0, _config_1.getRequestPhoneCodePerIpLimits)(),
        error: errors_1.UserPhoneCodeAttemptIpRateLimiterExceededError,
    },
    failedLoginAttemptPerPhone: {
        key: exports.RateLimitPrefix.failedLoginAttemptPerPhone,
        limits: (0, _config_1.getFailedLoginAttemptPerPhoneLimits)(),
        error: errors_1.UserLoginPhoneRateLimiterExceededError,
    },
    failedLoginAttemptPerEmailAddress: {
        key: exports.RateLimitPrefix.failedLoginAttemptPerEmailAddress,
        limits: (0, _config_1.getFailedLoginAttemptPerPhoneLimits)(),
        error: errors_1.UserLoginPhoneRateLimiterExceededError,
    },
    failedLoginAttemptPerIp: {
        key: exports.RateLimitPrefix.failedLoginAttemptPerIp,
        limits: (0, _config_1.getFailedLoginAttemptPerIpLimits)(),
        error: errors_1.UserLoginIpRateLimiterExceededError,
    },
    invoiceCreate: {
        key: exports.RateLimitPrefix.invoiceCreate,
        limits: (0, _config_1.getInvoiceCreateAttemptLimits)(),
        error: errors_1.InvoiceCreateRateLimiterExceededError,
    },
    invoiceCreateForRecipient: {
        key: exports.RateLimitPrefix.invoiceCreateForRecipient,
        limits: (0, _config_1.getInvoiceCreateForRecipientAttemptLimits)(),
        error: errors_1.InvoiceCreateForRecipientRateLimiterExceededError,
    },
    onChainAddressCreate: {
        key: exports.RateLimitPrefix.onChainAddressCreate,
        limits: (0, _config_1.getOnChainAddressCreateAttemptLimits)(),
        error: errors_1.OnChainAddressCreateRateLimiterExceededError,
    },
};
//# sourceMappingURL=index.js.map