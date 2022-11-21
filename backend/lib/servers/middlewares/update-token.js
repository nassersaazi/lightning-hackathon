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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToken = void 0;
const _config_1 = require("../../config/index");
const shared_1 = require("../../domain/shared");
const errors_1 = require("../../domain/authentication/errors");
const cache_1 = require("../../services/cache");
const kratos_1 = require("../../services/kratos");
const mongoose_1 = require("../../services/mongoose");
const tracing_1 = require("../../services/tracing");
const jwt = __importStar(require("jsonwebtoken"));
const jwtAlgorithms = ["HS256"];
const updateToken = async (req, res, next) => {
    const headers = req?.headers;
    let tokenPayload = null;
    const authz = headers.orgauthorization;
    if (!authz) {
        (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "no orgauthorization header" });
        next();
        return;
    }
    const rawToken = authz.slice(7);
    if (rawToken.length === 32) {
        (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "kratos token" });
        next();
        return;
    }
    try {
        tokenPayload = jwt.verify(rawToken, _config_1.JWT_SECRET, {
            algorithms: jwtAlgorithms,
        });
    }
    catch (err) {
        (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "token decoding issue" });
        next();
        return;
    }
    if (typeof tokenPayload === "string") {
        (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "token not a string" });
        next();
        return;
    }
    if (!tokenPayload) {
        (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "no tokenPayload" });
        next();
        return;
    }
    const uid = tokenPayload.uid;
    const user = await (0, mongoose_1.UsersRepository)().findById(uid);
    if (user instanceof Error) {
        (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "no uid" });
        // TODO: log error
        next();
        return;
    }
    const { phone } = user;
    if (!phone) {
        (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "no phone" });
        // TODO: log error
        // is there users who doesn't have phone on bbw?
        next();
        return;
    }
    let kratosToken;
    // the cache aim to limit to 1 session per kratos user on mobile phone
    // previously, with JWT, there is no notion of session.
    //
    // sessions will be useful because:
    // - it be possible for a user to know if other sessions are open from his account
    // and eventually log those accounts out
    // - it will be possible for an admin to revoke all sessions
    // - it will be possible to enhance user protection. if a session is attached to a mobile phone
    // then if the user agent in the request changes, it could be advisable for the user to relogin
    //
    // to keep the sessions clean, here we are caching the user credentials, so there is a lower likely that
    // during the migrations, a user is sending many requests simoultaneously and ends up with multiple sessions
    // just because the mobile app would not have update the token by the time another request is been initiated
    const cacheRes = await (0, cache_1.RedisCacheService)().get({ key: rawToken });
    if (!(cacheRes instanceof Error)) {
        (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "returning token from cache" });
        kratosToken = cacheRes;
        res.set("kratos-session-token", kratosToken);
        next();
        return;
    }
    const authService = (0, kratos_1.AuthWithPhonePasswordlessService)();
    let kratosResult = await authService.login(phone);
    // FIXME: only if we don't run the migration before
    if (kratosResult instanceof errors_1.LikelyNoUserWithThisPhoneExistError) {
        // user has not migrated to kratos or it's a new user
        kratosResult = await authService.createIdentityWithSession(phone);
    }
    if (kratosResult instanceof Error) {
        (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "kratos issue" });
        next();
        return;
    }
    const kratosUserId = kratosResult.kratosUserId;
    const account = await (0, mongoose_1.AccountsRepository)().findById(uid);
    if (account instanceof Error) {
        (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "account findby issue" });
        next();
        return;
    }
    const updatedAccount = await (0, mongoose_1.AccountsRepository)().update({
        ...account,
        kratosUserId,
    });
    if (updatedAccount instanceof Error) {
        (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "updateAccount issue" });
        (0, tracing_1.recordExceptionInCurrentSpan)({
            error: `error with attachKratosUser update-token: ${updatedAccount}`,
            level: shared_1.ErrorLevel.Critical,
            attributes: { kratosUserId, uid, phone },
        });
    }
    kratosToken = kratosResult.sessionToken;
    res.set("kratos-session-token", kratosToken);
    next();
    (0, tracing_1.addAttributesToCurrentSpan)({ authUpgrade: "token has been sent (without cache)" });
    const twoMonths = (60 * 60 * 24 * 30);
    await (0, cache_1.RedisCacheService)().set({
        key: rawToken,
        value: kratosToken,
        ttlSecs: twoMonths,
    });
    return;
};
exports.updateToken = updateToken;
//# sourceMappingURL=update-token.js.map