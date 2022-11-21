"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsdAmountTooLargeError = exports.BtcAmountTooLargeError = exports.UnknownBigIntConversionError = exports.BigIntFloatConversionError = exports.BigIntConversionError = exports.SafeWrapperError = exports.ValidationError = exports.DomainError = exports.RankedErrorLevel = exports.ErrorLevel = void 0;
exports.ErrorLevel = {
    Info: "info",
    Warn: "warn",
    Critical: "critical",
};
exports.RankedErrorLevel = [exports.ErrorLevel.Info, exports.ErrorLevel.Warn, exports.ErrorLevel.Critical];
class DomainError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.level = exports.ErrorLevel.Info;
    }
}
exports.DomainError = DomainError;
class ValidationError extends DomainError {
}
exports.ValidationError = ValidationError;
class SafeWrapperError extends DomainError {
    constructor() {
        super(...arguments);
        this.level = exports.ErrorLevel.Critical;
    }
}
exports.SafeWrapperError = SafeWrapperError;
class BigIntConversionError extends SafeWrapperError {
}
exports.BigIntConversionError = BigIntConversionError;
class BigIntFloatConversionError extends BigIntConversionError {
}
exports.BigIntFloatConversionError = BigIntFloatConversionError;
class UnknownBigIntConversionError extends BigIntConversionError {
    constructor() {
        super(...arguments);
        this.level = exports.ErrorLevel.Critical;
    }
}
exports.UnknownBigIntConversionError = UnknownBigIntConversionError;
class BtcAmountTooLargeError extends ValidationError {
}
exports.BtcAmountTooLargeError = BtcAmountTooLargeError;
class UsdAmountTooLargeError extends ValidationError {
}
exports.UsdAmountTooLargeError = UsdAmountTooLargeError;
//# sourceMappingURL=errors.js.map