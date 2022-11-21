"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApolloServer = exports.isEditor = exports.isAuthenticated = void 0;
const http_1 = require("http");
const _app_1 = require("../app/index");
const _config_1 = require("../config/index");
const geetest_1 = __importDefault(require("../services/geetest"));
const logger_1 = require("../services/logger");
const tracing_1 = require("../services/tracing");
const apollo_server_core_1 = require("apollo-server-core");
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const express_jwt_1 = require("express-jwt");
const graphql_1 = require("graphql");
const graphql_shield_1 = require("graphql-shield");
const helmet_1 = __importDefault(require("helmet"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pino_http_1 = __importDefault(require("pino-http"));
const subscriptions_transport_ws_1 = require("subscriptions-transport-ws");
const error_1 = require("../graphql/error");
const error_map_1 = require("../graphql/error-map");
const users_ips_1 = require("../domain/users-ips");
const graphql_query_complexity_1 = require("graphql-query-complexity");
const graphql_query_complexity_apollo_plugin_1 = require("graphql-query-complexity-apollo-plugin");
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const accounts_1 = require("../domain/accounts");
const oathkeeper_1 = require("../services/oathkeeper");
const shared_1 = require("../domain/shared");
const playground_1 = require("../graphql/playground");
const healthz_1 = __importDefault(require("./middlewares/healthz"));
const auth_router_1 = __importDefault(require("./middlewares/auth-router"));
const update_token_1 = require("./middlewares/update-token");
const graphqlLogger = logger_1.baseLogger.child({
    module: "graphql",
});
const apolloConfig = (0, _config_1.getApolloConfig)();
exports.isAuthenticated = (0, graphql_shield_1.rule)({ cache: "contextual" })((parent, args, ctx) => {
    return !!ctx.domainAccount || new error_1.AuthenticationError({ logger: logger_1.baseLogger });
});
exports.isEditor = (0, graphql_shield_1.rule)({ cache: "contextual" })((parent, args, ctx) => {
    return ctx.domainAccount.isEditor
        ? true
        : new error_1.AuthorizationError({ logger: logger_1.baseLogger });
});
const jwtAlgorithms = ["RS256"];
const geeTestConfig = (0, _config_1.getGeetestConfig)();
const geetest = (0, geetest_1.default)(geeTestConfig);
const setGqlContext = async (req, res, next) => {
    const tokenPayload = req.token;
    const body = req.body ?? null;
    const ipString = _config_1.isDev
        ? req.ip
        : req.headers["x-real-ip"] || req.headers["x-forwarded-for"];
    const ip = (0, users_ips_1.parseIps)(ipString);
    const gqlContext = await sessionContext({
        tokenPayload,
        ip,
        body,
    });
    const reqWithGqlContext = req;
    reqWithGqlContext.gqlContext = gqlContext;
    (0, tracing_1.addAttributesToCurrentSpanAndPropagate)({
        [tracing_1.SemanticAttributes.HTTP_CLIENT_IP]: ip,
        [tracing_1.ACCOUNT_USERNAME]: gqlContext.domainAccount?.username,
        [tracing_1.SemanticAttributes.ENDUSER_ID]: gqlContext.domainAccount?.id || tokenPayload?.sub,
    }, next);
};
const sessionContext = ({ tokenPayload, ip, body, }) => {
    const logger = graphqlLogger.child({ tokenPayload, body });
    let domainUser = null;
    let domainAccount;
    return (0, tracing_1.addAttributesToCurrentSpanAndPropagate)({
        "token.sub": tokenPayload?.sub,
        [tracing_1.SemanticAttributes.HTTP_CLIENT_IP]: ip,
    }, async () => {
        // note: value should match (ie: "anon") if not an accountId
        // settings from dev/ory/oathkeeper.yml/authenticator/anonymous/config/subjet
        const maybeKratosUserId = (0, accounts_1.checkedToKratosUserId)(tokenPayload?.sub || "");
        if (!(maybeKratosUserId instanceof shared_1.ValidationError)) {
            const userId = maybeKratosUserId;
            const account = await _app_1.Accounts.getAccountFromKratosUserId(userId);
            if (account instanceof Error)
                throw Error;
            domainAccount = account;
            const loggedInUser = await _app_1.Users.getUserForLogin({
                userId: account.id,
                ip,
                logger,
            });
            if (loggedInUser instanceof Error)
                throw new apollo_server_express_1.ApolloError("Invalid user authentication", "INVALID_AUTHENTICATION", {
                    reason: loggedInUser,
                });
            domainUser = loggedInUser;
            (0, tracing_1.addAttributesToCurrentSpan)({ [tracing_1.ACCOUNT_USERNAME]: domainAccount?.username });
        }
        return {
            logger,
            // FIXME: we should not return this for the admin graphql endpoint
            domainUser,
            domainAccount,
            geetest,
            ip,
        };
    });
};
const startApolloServer = async ({ schema, port, startSubscriptionServer = false, type, }) => {
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    const apolloPlugins = [
        (0, graphql_query_complexity_apollo_plugin_1.createComplexityPlugin)({
            schema,
            estimators: [(0, graphql_query_complexity_1.fieldExtensionsEstimator)(), (0, graphql_query_complexity_1.simpleEstimator)({ defaultComplexity: 1 })],
            maximumComplexity: 200,
            onComplete: (complexity) => {
                // TODO(telemetry): add complexity value to span
                logger_1.baseLogger.debug({ complexity }, "queryComplexity");
            },
        }),
        (0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
        apolloConfig.playground
            ? (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)({
                settings: { "schema.polling.enable": false },
                tabs: [
                    {
                        endpoint: apolloConfig.playgroundUrl,
                        ...playground_1.playgroundTabs.default,
                    },
                ],
            })
            : (0, apollo_server_core_1.ApolloServerPluginLandingPageDisabled)(),
    ];
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema,
        cache: "bounded",
        introspection: apolloConfig.playground,
        plugins: apolloPlugins,
        context: (context) => {
            return context.req.gqlContext;
        },
        formatError: (err) => {
            try {
                const reportErrorToClient = err instanceof apollo_server_express_1.ApolloError || err instanceof graphql_1.GraphQLError;
                const reportedError = {
                    message: err.message,
                    locations: err.locations,
                    path: err.path,
                    code: err.extensions?.code,
                };
                return reportErrorToClient
                    ? reportedError
                    : { message: `Error processing GraphQL request ${reportedError.code}` };
            }
            catch (err) {
                throw (0, error_map_1.mapError)(err);
            }
        },
    });
    app.use("/auth", auth_router_1.default);
    const enablePolicy = apolloConfig.playground ? false : undefined;
    app.use((0, helmet_1.default)({
        crossOriginEmbedderPolicy: enablePolicy,
        crossOriginOpenerPolicy: enablePolicy,
        crossOriginResourcePolicy: enablePolicy,
        contentSecurityPolicy: enablePolicy,
    }));
    // Health check
    app.get("/healthz", (0, healthz_1.default)({
        checkDbConnectionStatus: true,
        checkRedisStatus: true,
        checkLndsStatus: false,
    }));
    app.use((0, pino_http_1.default)({
        logger: graphqlLogger,
        wrapSerializers: false,
        autoLogging: {
            ignore: (req) => req.url === "/healthz",
        },
    }));
    const secret = jwks_rsa_1.default.expressJwtSecret((0, _config_1.getJwksArgs)()); // https://github.com/auth0/express-jwt/issues/288#issuecomment-1122524366
    app.use("/graphql", (0, express_jwt_1.expressjwt)({
        secret,
        algorithms: jwtAlgorithms,
        credentialsRequired: true,
        requestProperty: "token",
        issuer: "galoy.io",
    }));
    app.use(update_token_1.updateToken);
    app.use("/graphql", setGqlContext);
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: "/graphql" });
    return new Promise((resolve, reject) => {
        httpServer.listen({ port }, () => {
            if (startSubscriptionServer) {
                const apolloSubscriptionServer = new subscriptions_transport_ws_1.SubscriptionServer({
                    execute: graphql_1.execute,
                    subscribe: graphql_1.subscribe,
                    schema,
                    async onConnect(connectionParams, webSocket, 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    connectionContext) {
                        const { request } = connectionContext;
                        const authz = (connectionParams.authorization ||
                            connectionParams.Authorization);
                        // TODO: also manage the case where there is a cookie in the request
                        // make request to oathkeeper
                        const originalToken = authz?.slice(7);
                        const newToken = await (0, oathkeeper_1.sendOathkeeperRequest)(originalToken);
                        // TODO: see how returning an error affect the websocket connection
                        if (newToken instanceof Error)
                            return newToken;
                        const keyJwks = await (0, jwks_rsa_1.default)((0, _config_1.getJwksArgs)()).getSigningKey();
                        const tokenPayload = jsonwebtoken_1.default.verify(newToken, keyJwks.getPublicKey(), {
                            algorithms: jwtAlgorithms,
                        });
                        if (typeof tokenPayload === "string") {
                            throw new Error("tokenPayload should be an object");
                        }
                        return sessionContext({
                            tokenPayload,
                            ip: request?.socket?.remoteAddress,
                            // TODO: Resolve what's needed here
                            body: null,
                        });
                    },
                }, {
                    server: httpServer,
                    path: apolloServer.graphqlPath,
                });
                ["SIGINT", "SIGTERM"].forEach((signal) => {
                    process.on(signal, () => apolloSubscriptionServer.close());
                });
            }
            console.log(`🚀 "${type}" server ready at http://localhost:${port}${apolloServer.graphqlPath}`);
            resolve({ app, httpServer, apolloServer });
        });
        httpServer.on("error", (err) => {
            console.error(err);
            reject(err);
        });
    });
};
exports.startApolloServer = startApolloServer;
//# sourceMappingURL=graphql-server.js.map