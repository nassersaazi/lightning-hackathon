"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidAccountIdError = exports.UsernameIsImmutableError = exports.UsernameNotAvailableError = exports.AccountError = void 0;
const shared_1 = require("../shared");
class AccountError extends shared_1.DomainError {
}
exports.AccountError = AccountError;
class UsernameNotAvailableError extends AccountError {
}
exports.UsernameNotAvailableError = UsernameNotAvailableError;
class UsernameIsImmutableError extends AccountError {
}
exports.UsernameIsImmutableError = UsernameIsImmutableError;
class InvalidAccountIdError extends AccountError {
}
exports.InvalidAccountIdError = InvalidAccountIdError;
//# sourceMappingURL=errors.js.map