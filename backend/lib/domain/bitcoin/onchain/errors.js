"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnChainServiceUnavailableError = exports.CouldNotFindOnChainTransactionError = exports.UnknownOnChainServiceError = exports.InsufficientOnChainFundsError = exports.CPFPAncestorLimitReachedError = exports.OnChainServiceError = exports.TransactionDecodeError = exports.OnChainError = void 0;
const shared_1 = require("../../shared");
class OnChainError extends shared_1.DomainError {
}
exports.OnChainError = OnChainError;
class TransactionDecodeError extends OnChainError {
}
exports.TransactionDecodeError = TransactionDecodeError;
class OnChainServiceError extends OnChainError {
}
exports.OnChainServiceError = OnChainServiceError;
class CPFPAncestorLimitReachedError extends OnChainServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.CPFPAncestorLimitReachedError = CPFPAncestorLimitReachedError;
class InsufficientOnChainFundsError extends OnChainServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.InsufficientOnChainFundsError = InsufficientOnChainFundsError;
class UnknownOnChainServiceError extends OnChainServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownOnChainServiceError = UnknownOnChainServiceError;
class CouldNotFindOnChainTransactionError extends OnChainServiceError {
}
exports.CouldNotFindOnChainTransactionError = CouldNotFindOnChainTransactionError;
class OnChainServiceUnavailableError extends OnChainServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.OnChainServiceUnavailableError = OnChainServiceUnavailableError;
//# sourceMappingURL=errors.js.map