"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownLedgerError = exports.NoTransactionToSettleError = exports.LedgerFacadeError = void 0;
const shared_1 = require("../../../domain/shared");
class LedgerFacadeError extends shared_1.DomainError {
}
exports.LedgerFacadeError = LedgerFacadeError;
class NoTransactionToSettleError extends LedgerFacadeError {
}
exports.NoTransactionToSettleError = NoTransactionToSettleError;
class UnknownLedgerError extends LedgerFacadeError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownLedgerError = UnknownLedgerError;
//# sourceMappingURL=errors.js.map