"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownKratosError = exports.IncompatibleSchemaUpgradeError = exports.MissingTotpKratosError = exports.MissingExpiredAtKratosError = exports.AuthenticationKratosError = exports.LikelyUserAlreadyExistError = exports.LikelyNoUserWithThisPhoneExistError = exports.KratosError = exports.AuthenticationError = void 0;
const shared_1 = require("../shared");
class AuthenticationError extends shared_1.DomainError {
}
exports.AuthenticationError = AuthenticationError;
class KratosError extends AuthenticationError {
}
exports.KratosError = KratosError;
class LikelyNoUserWithThisPhoneExistError extends KratosError {
}
exports.LikelyNoUserWithThisPhoneExistError = LikelyNoUserWithThisPhoneExistError;
class LikelyUserAlreadyExistError extends KratosError {
}
exports.LikelyUserAlreadyExistError = LikelyUserAlreadyExistError;
class AuthenticationKratosError extends KratosError {
}
exports.AuthenticationKratosError = AuthenticationKratosError;
class MissingExpiredAtKratosError extends KratosError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.MissingExpiredAtKratosError = MissingExpiredAtKratosError;
class MissingTotpKratosError extends KratosError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.MissingTotpKratosError = MissingTotpKratosError;
class IncompatibleSchemaUpgradeError extends KratosError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.IncompatibleSchemaUpgradeError = IncompatibleSchemaUpgradeError;
class UnknownKratosError extends KratosError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownKratosError = UnknownKratosError;
//# sourceMappingURL=errors.js.map