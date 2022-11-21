"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownPubSubError = exports.PubSubServiceError = exports.PubSubError = void 0;
const shared_1 = require("../shared");
class PubSubError extends shared_1.DomainError {
}
exports.PubSubError = PubSubError;
class PubSubServiceError extends PubSubError {
}
exports.PubSubServiceError = PubSubServiceError;
class UnknownPubSubError extends PubSubError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownPubSubError = UnknownPubSubError;
//# sourceMappingURL=errors.js.map