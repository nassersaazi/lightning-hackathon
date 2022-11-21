"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownColdStorageServiceError = exports.InvalidOrNonWalletTransactionError = exports.InsufficientBalanceForRebalanceError = exports.InvalidCurrentColdStorageWalletServiceError = exports.ColdStorageServiceError = exports.ColdStorageError = void 0;
const shared_1 = require("../shared");
class ColdStorageError extends shared_1.DomainError {
}
exports.ColdStorageError = ColdStorageError;
class ColdStorageServiceError extends ColdStorageError {
}
exports.ColdStorageServiceError = ColdStorageServiceError;
class InvalidCurrentColdStorageWalletServiceError extends ColdStorageServiceError {
}
exports.InvalidCurrentColdStorageWalletServiceError = InvalidCurrentColdStorageWalletServiceError;
class InsufficientBalanceForRebalanceError extends ColdStorageServiceError {
}
exports.InsufficientBalanceForRebalanceError = InsufficientBalanceForRebalanceError;
class InvalidOrNonWalletTransactionError extends ColdStorageServiceError {
}
exports.InvalidOrNonWalletTransactionError = InvalidOrNonWalletTransactionError;
class UnknownColdStorageServiceError extends ColdStorageServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownColdStorageServiceError = UnknownColdStorageServiceError;
//# sourceMappingURL=errors.js.map