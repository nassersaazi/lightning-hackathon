"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigError = void 0;
class ConfigError extends Error {
    constructor(message, data) {
        super(message);
        this.name = this.constructor.name;
        this.data = data;
    }
}
exports.ConfigError = ConfigError;
//# sourceMappingURL=error.js.map