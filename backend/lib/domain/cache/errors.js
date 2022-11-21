"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownCacheServiceError = exports.CacheUndefinedError = exports.CacheNotAvailableError = exports.CacheServiceError = exports.CacheError = void 0;
const shared_1 = require("../shared");
class CacheError extends shared_1.DomainError {
}
exports.CacheError = CacheError;
class CacheServiceError extends CacheError {
}
exports.CacheServiceError = CacheServiceError;
class CacheNotAvailableError extends CacheServiceError {
}
exports.CacheNotAvailableError = CacheNotAvailableError;
class CacheUndefinedError extends CacheServiceError {
}
exports.CacheUndefinedError = CacheUndefinedError;
class UnknownCacheServiceError extends CacheServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownCacheServiceError = UnknownCacheServiceError;
//# sourceMappingURL=errors.js.map