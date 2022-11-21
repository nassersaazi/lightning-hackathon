"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownOathkeeperServiceError = exports.OathkeeperForbiddenServiceError = exports.OathkeeperMissingAuthorizationHeaderError = exports.OathkeeperUnauthorizedServiceError = exports.OathkeeperError = void 0;
const shared_1 = require("../shared");
class OathkeeperError extends shared_1.DomainError {
}
exports.OathkeeperError = OathkeeperError;
class OathkeeperUnauthorizedServiceError extends OathkeeperError {
}
exports.OathkeeperUnauthorizedServiceError = OathkeeperUnauthorizedServiceError;
class OathkeeperMissingAuthorizationHeaderError extends OathkeeperError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.OathkeeperMissingAuthorizationHeaderError = OathkeeperMissingAuthorizationHeaderError;
class OathkeeperForbiddenServiceError extends OathkeeperError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.OathkeeperForbiddenServiceError = OathkeeperForbiddenServiceError;
class UnknownOathkeeperServiceError extends OathkeeperError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownOathkeeperServiceError = UnknownOathkeeperServiceError;
//# sourceMappingURL=errors.js.map