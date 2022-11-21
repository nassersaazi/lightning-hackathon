"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownPriceServiceError = exports.PriceHistoryNotAvailableError = exports.PriceNotAvailableError = exports.PriceServiceError = exports.PriceError = void 0;
const shared_1 = require("../shared");
class PriceError extends shared_1.DomainError {
}
exports.PriceError = PriceError;
class PriceServiceError extends PriceError {
}
exports.PriceServiceError = PriceServiceError;
class PriceNotAvailableError extends PriceServiceError {
}
exports.PriceNotAvailableError = PriceNotAvailableError;
class PriceHistoryNotAvailableError extends PriceServiceError {
}
exports.PriceHistoryNotAvailableError = PriceHistoryNotAvailableError;
class UnknownPriceServiceError extends PriceServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownPriceServiceError = UnknownPriceServiceError;
//# sourceMappingURL=errors.js.map