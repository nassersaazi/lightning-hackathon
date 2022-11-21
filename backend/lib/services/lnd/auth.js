"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIMEOUT_PAYMENT = exports.params = void 0;
const lightning_1 = require("lightning");
const _config_1 = require("../../config/index");
const lodash_sortby_1 = __importDefault(require("lodash.sortby"));
const inputs = (0, _config_1.getLndParams)();
const addProps = (array) => {
    const result = array.map((input) => {
        const socket = `${input.node}:${input.port}`;
        return {
            ...input,
            socket,
            lnd: (0, lightning_1.authenticatedLndGrpc)({ ...input, socket }).lnd,
            active: false,
        };
    });
    return result;
};
exports.params = addProps((0, lodash_sortby_1.default)(inputs, ["priority"]));
exports.TIMEOUT_PAYMENT = process.env.NETWORK !== "regtest" ? 45000 : 3000;
//# sourceMappingURL=auth.js.map