"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownCaptchaError = exports.CaptchaUserFailToPassError = exports.CaptchaError = void 0;
const shared_1 = require("../shared");
class CaptchaError extends shared_1.DomainError {
}
exports.CaptchaError = CaptchaError;
class CaptchaUserFailToPassError extends CaptchaError {
}
exports.CaptchaUserFailToPassError = CaptchaUserFailToPassError;
class UnknownCaptchaError extends CaptchaError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownCaptchaError = UnknownCaptchaError;
//# sourceMappingURL=errors.js.map