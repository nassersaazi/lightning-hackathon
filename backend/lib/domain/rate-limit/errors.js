"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnChainAddressCreateRateLimiterExceededError = exports.InvoiceCreateForRecipientRateLimiterExceededError = exports.InvoiceCreateRateLimiterExceededError = exports.UserLoginPhoneRateLimiterExceededError = exports.UserLoginIpRateLimiterExceededError = exports.UserPhoneCodeAttemptIpRateLimiterExceededError = exports.UserPhoneCodeAttemptPhoneMinIntervalRateLimiterExceededError = exports.UserPhoneCodeAttemptPhoneRateLimiterExceededError = exports.RateLimiterExceededError = exports.UnknownRateLimitServiceError = exports.RateLimitServiceError = exports.RateLimitError = void 0;
const shared_1 = require("../shared");
class RateLimitError extends shared_1.DomainError {
}
exports.RateLimitError = RateLimitError;
class RateLimitServiceError extends RateLimitError {
}
exports.RateLimitServiceError = RateLimitServiceError;
class UnknownRateLimitServiceError extends RateLimitServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownRateLimitServiceError = UnknownRateLimitServiceError;
class RateLimiterExceededError extends RateLimitServiceError {
}
exports.RateLimiterExceededError = RateLimiterExceededError;
class UserPhoneCodeAttemptPhoneRateLimiterExceededError extends RateLimiterExceededError {
}
exports.UserPhoneCodeAttemptPhoneRateLimiterExceededError = UserPhoneCodeAttemptPhoneRateLimiterExceededError;
class UserPhoneCodeAttemptPhoneMinIntervalRateLimiterExceededError extends RateLimiterExceededError {
}
exports.UserPhoneCodeAttemptPhoneMinIntervalRateLimiterExceededError = UserPhoneCodeAttemptPhoneMinIntervalRateLimiterExceededError;
class UserPhoneCodeAttemptIpRateLimiterExceededError extends RateLimiterExceededError {
}
exports.UserPhoneCodeAttemptIpRateLimiterExceededError = UserPhoneCodeAttemptIpRateLimiterExceededError;
class UserLoginIpRateLimiterExceededError extends RateLimiterExceededError {
}
exports.UserLoginIpRateLimiterExceededError = UserLoginIpRateLimiterExceededError;
class UserLoginPhoneRateLimiterExceededError extends RateLimiterExceededError {
}
exports.UserLoginPhoneRateLimiterExceededError = UserLoginPhoneRateLimiterExceededError;
class InvoiceCreateRateLimiterExceededError extends RateLimiterExceededError {
}
exports.InvoiceCreateRateLimiterExceededError = InvoiceCreateRateLimiterExceededError;
class InvoiceCreateForRecipientRateLimiterExceededError extends RateLimiterExceededError {
}
exports.InvoiceCreateForRecipientRateLimiterExceededError = InvoiceCreateForRecipientRateLimiterExceededError;
class OnChainAddressCreateRateLimiterExceededError extends RateLimiterExceededError {
}
exports.OnChainAddressCreateRateLimiterExceededError = OnChainAddressCreateRateLimiterExceededError;
//# sourceMappingURL=errors.js.map