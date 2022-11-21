"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownDealerPriceServiceError = exports.DealerStalePriceError = exports.NoConnectionToDealerError = exports.DealerPriceNotAvailableError = exports.DealerPriceServiceError = exports.DealerPriceError = void 0;
const shared_1 = require("../shared");
class DealerPriceError extends shared_1.DomainError {
}
exports.DealerPriceError = DealerPriceError;
class DealerPriceServiceError extends DealerPriceError {
}
exports.DealerPriceServiceError = DealerPriceServiceError;
class DealerPriceNotAvailableError extends DealerPriceServiceError {
}
exports.DealerPriceNotAvailableError = DealerPriceNotAvailableError;
class NoConnectionToDealerError extends DealerPriceServiceError {
}
exports.NoConnectionToDealerError = NoConnectionToDealerError;
class DealerStalePriceError extends DealerPriceServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.DealerStalePriceError = DealerStalePriceError;
class UnknownDealerPriceServiceError extends DealerPriceServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownDealerPriceServiceError = UnknownDealerPriceServiceError;
//# sourceMappingURL=errors.js.map