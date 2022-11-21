"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownNotificationsServiceError = exports.InvalidDeviceNotificationsServiceError = exports.NotificationsServiceError = exports.NotificationsError = void 0;
const shared_1 = require("../shared");
class NotificationsError extends shared_1.DomainError {
}
exports.NotificationsError = NotificationsError;
class NotificationsServiceError extends NotificationsError {
}
exports.NotificationsServiceError = NotificationsServiceError;
class InvalidDeviceNotificationsServiceError extends NotificationsServiceError {
}
exports.InvalidDeviceNotificationsServiceError = InvalidDeviceNotificationsServiceError;
class UnknownNotificationsServiceError extends NotificationsError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownNotificationsServiceError = UnknownNotificationsServiceError;
//# sourceMappingURL=errors.js.map