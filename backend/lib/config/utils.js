"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = void 0;
const lodash_mergewith_1 = __importDefault(require("lodash.mergewith"));
const merge = (defaultConfig, customConfig) => (0, lodash_mergewith_1.default)(defaultConfig, customConfig, (a, b) => (Array.isArray(b) ? b : undefined));
exports.merge = merge;
//# sourceMappingURL=utils.js.map