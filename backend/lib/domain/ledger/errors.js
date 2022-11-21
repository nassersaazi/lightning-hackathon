"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouldNotFindTransactionMetadataError = exports.CouldNotFindTransactionError = exports.UnknownLedgerError = exports.NoTransactionToSettleError = exports.FeeDifferenceError = exports.LedgerServiceError = exports.LedgerError = void 0;
const shared_1 = require("../shared");
class LedgerError extends shared_1.DomainError {
}
exports.LedgerError = LedgerError;
class LedgerServiceError extends LedgerError {
}
exports.LedgerServiceError = LedgerServiceError;
class FeeDifferenceError extends LedgerError {
}
exports.FeeDifferenceError = FeeDifferenceError;
class NoTransactionToSettleError extends LedgerServiceError {
}
exports.NoTransactionToSettleError = NoTransactionToSettleError;
class UnknownLedgerError extends LedgerServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownLedgerError = UnknownLedgerError;
class CouldNotFindTransactionError extends LedgerError {
}
exports.CouldNotFindTransactionError = CouldNotFindTransactionError;
class CouldNotFindTransactionMetadataError extends CouldNotFindTransactionError {
}
exports.CouldNotFindTransactionMetadataError = CouldNotFindTransactionMetadataError;
//# sourceMappingURL=errors.js.map