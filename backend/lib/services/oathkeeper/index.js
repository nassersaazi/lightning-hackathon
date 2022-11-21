"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOathkeeperRequest = void 0;
const _config_1 = require("../../config/index");
const errors_1 = require("../../domain/oathkeeper/errors");
const axios_1 = __importDefault(require("axios"));
const sendOathkeeperRequest = async (token) => {
    const requestUrl = `${(0, _config_1.decisionsApi)()}graphql`;
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    try {
        const res = await (0, axios_1.default)({
            url: requestUrl,
            method: "POST",
            headers,
        });
        const jwt = res.headers.authorization;
        if (!jwt) {
            return new errors_1.OathkeeperMissingAuthorizationHeaderError();
        }
        return jwt.slice(7);
    }
    catch (err) {
        if (err.response?.status === 401) {
            return new errors_1.OathkeeperUnauthorizedServiceError(err.message || err);
        }
        if (err.response?.status === 403) {
            return new errors_1.OathkeeperForbiddenServiceError(err.message || err);
        }
        return new errors_1.UnknownOathkeeperServiceError(err.message || err);
    }
};
exports.sendOathkeeperRequest = sendOathkeeperRequest;
//# sourceMappingURL=index.js.map