"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownLockServiceError = exports.ResourceExpiredLockServiceError = exports.ResourceAttemptsLockServiceError = exports.LockServiceError = exports.LockError = void 0;
const shared_1 = require("../shared");
class LockError extends shared_1.DomainError {
}
exports.LockError = LockError;
class LockServiceError extends LockError {
}
exports.LockServiceError = LockServiceError;
class ResourceAttemptsLockServiceError extends LockServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Warn;
    }
}
exports.ResourceAttemptsLockServiceError = ResourceAttemptsLockServiceError;
class ResourceExpiredLockServiceError extends LockServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.ResourceExpiredLockServiceError = ResourceExpiredLockServiceError;
class UnknownLockServiceError extends LockServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownLockServiceError = UnknownLockServiceError;
//# sourceMappingURL=errors.js.map