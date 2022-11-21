"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownPhoneProviderServiceError = exports.PhoneProviderConnectionError = exports.UnsubscribedRecipientPhoneProviderError = exports.RestrictedRegionPhoneProviderError = exports.InvalidPhoneNumberPhoneProviderError = exports.PhoneProviderServiceError = void 0;
const shared_1 = require("../shared");
class PhoneProviderServiceError extends shared_1.DomainError {
}
exports.PhoneProviderServiceError = PhoneProviderServiceError;
class InvalidPhoneNumberPhoneProviderError extends PhoneProviderServiceError {
}
exports.InvalidPhoneNumberPhoneProviderError = InvalidPhoneNumberPhoneProviderError;
class RestrictedRegionPhoneProviderError extends PhoneProviderServiceError {
}
exports.RestrictedRegionPhoneProviderError = RestrictedRegionPhoneProviderError;
class UnsubscribedRecipientPhoneProviderError extends PhoneProviderServiceError {
}
exports.UnsubscribedRecipientPhoneProviderError = UnsubscribedRecipientPhoneProviderError;
class PhoneProviderConnectionError extends PhoneProviderServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Warn;
    }
}
exports.PhoneProviderConnectionError = PhoneProviderConnectionError;
class UnknownPhoneProviderServiceError extends PhoneProviderServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownPhoneProviderServiceError = UnknownPhoneProviderServiceError;
//# sourceMappingURL=errors.js.map