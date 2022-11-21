"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownIpFetcherServiceError = exports.IpFetcherServiceError = exports.IpFetcherError = void 0;
const shared_1 = require("../shared");
class IpFetcherError extends shared_1.DomainError {
}
exports.IpFetcherError = IpFetcherError;
class IpFetcherServiceError extends IpFetcherError {
}
exports.IpFetcherServiceError = IpFetcherServiceError;
class UnknownIpFetcherServiceError extends IpFetcherError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownIpFetcherServiceError = UnknownIpFetcherServiceError;
//# sourceMappingURL=errors.js.map