"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseLogger = void 0;
const pino_1 = __importDefault(require("pino"));
exports.baseLogger = (0, pino_1.default)({
    level: process.env.LOGLEVEL || "info",
    redact: [
        "req.headers.authorization",
        "req.headers.cookie",
        "body.variables.code",
        "req.body.variables.code",
    ],
});
//# sourceMappingURL=logger.js.map