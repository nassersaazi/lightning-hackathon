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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const jwt = __importStar(require("jsonwebtoken"));
const _app_1 = require("../../app/index");
const _config_1 = require("../../config/index");
const users_ips_1 = require("../../domain/users-ips");
const errors_1 = require("../../domain/authentication/errors");
const error_map_1 = require("../../graphql/error-map");
const logger_1 = require("../../services/logger");
const tracing_1 = require("../../services/tracing");
const mongoose_1 = require("../../services/mongoose");
const private_1 = require("../../services/kratos/private");
const kratos_1 = require("../../services/kratos");
const graphqlLogger = logger_1.baseLogger.child({
    module: "graphql",
});
const authRouter = express_1.default.Router({ caseSensitive: true });
const { corsAllowedOrigins } = (0, _config_1.getKratosConfig)();
authRouter.use((0, cors_1.default)({ origin: corsAllowedOrigins, credentials: true }));
authRouter.post("/browser", async (req, res) => {
    const ipString = _config_1.isDev ? req?.ip : req?.headers["x-real-ip"];
    const ip = (0, users_ips_1.parseIps)(ipString);
    if (ip === undefined) {
        throw new Error("IP is not defined");
    }
    const logger = graphqlLogger.child({ ip, body: req.body });
    try {
        const { data } = await private_1.kratosPublic.toSession(undefined, req.header("Cookie"));
        const kratosLoginResp = await _app_1.Users.loginWithEmail({
            kratosUserId: data.identity.id,
            emailAddress: data.identity.traits.email,
            logger,
            ip,
        });
        if (kratosLoginResp instanceof Error) {
            return res.send({ error: (0, error_map_1.mapError)(kratosLoginResp) });
        }
        res.send({ kratosUserId: data.identity.id, ...kratosLoginResp });
    }
    catch (error) {
        res.send({ error: "Browser auth error" });
    }
});
const jwtAlgorithms = ["HS256"];
// used by oathkeeper to validate LegacyJWT and SessionToken
// should not be public
authRouter.post("/validatetoken", (0, tracing_1.wrapAsyncToRunInSpan)({
    namespace: "validatetoken",
    fn: async (req, res) => {
        const headers = req?.headers;
        let tokenPayload = null;
        const authz = headers.authorization || headers.Authorization;
        if (!authz) {
            res.status(401).send({ error: "Missing token" });
            return;
        }
        const rawToken = authz.slice(7);
        // new flow
        if (rawToken.length === 32) {
            const kratosRes = await (0, kratos_1.validateKratosToken)(rawToken);
            if (kratosRes instanceof errors_1.KratosError) {
                res.status(401).send({ error: `${kratosRes.name} ${kratosRes.message}` });
                return;
            }
            (0, tracing_1.addAttributesToCurrentSpan)({ token: "kratos" });
            res.json({ sub: kratosRes.kratosUserId });
            return;
        }
        // legacy flow
        try {
            tokenPayload = jwt.verify(rawToken, _config_1.JWT_SECRET, {
                algorithms: jwtAlgorithms,
            });
        }
        catch (err) {
            res.status(401).send({ error: "Token validation error" });
            return;
        }
        if (typeof tokenPayload === "string") {
            res.status(401).send({ error: "tokenPayload should be an object" });
            return;
        }
        if (!tokenPayload) {
            res.status(401).send({ error: "Token validation error" });
            return;
        }
        const account = await (0, mongoose_1.AccountsRepository)().findById(tokenPayload.uid);
        if (account instanceof Error) {
            res.status(401).send({ error: `${account.name} ${account.message}` });
            return;
        }
        let kratosUserId;
        if (!account.kratosUserId) {
            const user = await (0, mongoose_1.UsersRepository)().findById(account.id);
            if (user instanceof Error) {
                res.status(401).send({ error: `${user.name} ${user.message}` });
                return;
            }
            const authService = (0, kratos_1.AuthWithPhonePasswordlessService)();
            const phone = user.phone;
            if (!phone) {
                res.status(401).send({ error: `phone is missing` });
                return;
            }
            const kratosRes = await authService.login(phone);
            if (kratosRes instanceof errors_1.LikelyNoUserWithThisPhoneExistError) {
                // expected to fail pre migration.
                // post migration: not going into this loop because kratosUserId would exist
                const kratosUserId_ = await authService.createIdentityNoSession(phone);
                if (kratosUserId_ instanceof Error) {
                    res
                        .status(401)
                        .send({ error: `${kratosUserId_.name} ${kratosUserId_.message}` });
                    return;
                }
                kratosUserId = kratosUserId_;
                const accountRes = await (0, mongoose_1.AccountsRepository)().update({
                    ...account,
                    kratosUserId,
                });
                if (accountRes instanceof Error) {
                    res.status(401).send({ error: `${accountRes.name} ${accountRes.message}` });
                    return;
                }
            }
        }
        (0, tracing_1.addAttributesToCurrentSpan)({ token: "jwt" });
        res.json({ sub: kratosUserId || account.kratosUserId });
    },
}));
exports.default = authRouter;
//# sourceMappingURL=auth-router.js.map