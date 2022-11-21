"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateKratosToken = exports.listSessions = void 0;
const errors_1 = require("../../domain/authentication/errors");
const private_1 = require("./private");
__exportStar(require("./auth-phone-no-password"), exports);
__exportStar(require("./cron"), exports);
__exportStar(require("./identity"), exports);
const listSessions = async (userId) => {
    const res = await (0, private_1.listSessionsInternal)(userId);
    if (res instanceof Error)
        return res;
    return res.map(private_1.toDomainSession);
};
exports.listSessions = listSessions;
const validateKratosToken = async (SessionToken) => {
    let session;
    try {
        const { data } = await private_1.kratosPublic.toSession(SessionToken);
        session = (0, private_1.toDomainSession)(data);
    }
    catch (err) {
        if (err.message === "Request failed with status code 401") {
            return new errors_1.AuthenticationKratosError(err);
        }
        return new errors_1.UnknownKratosError(err);
    }
    // TODO: should return aal level also
    return {
        kratosUserId: session.identity.id,
        session,
    };
};
exports.validateKratosToken = validateKratosToken;
//# sourceMappingURL=index.js.map