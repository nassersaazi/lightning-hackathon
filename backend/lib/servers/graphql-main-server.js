"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApolloServerForCoreSchema = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const graphql_middleware_1 = require("graphql-middleware");
const graphql_shield_1 = require("graphql-shield");
const mongodb_1 = require("../services/mongodb");
const health_1 = require("../services/lnd/health");
const logger_1 = require("../services/logger");
const _config_1 = require("../config/index");
const graphql_1 = require("../graphql");
const graphql_server_1 = require("./graphql-server");
const wallet_id_1 = require("./middlewares/wallet-id");
const graphqlLogger = logger_1.baseLogger.child({ module: "graphql" });
dotenv_1.default.config();
async function startApolloServerForCoreSchema() {
    const permissions = (0, graphql_shield_1.shield)({
        Query: {
            me: graphql_server_1.isAuthenticated,
            onChainTxFee: graphql_server_1.isAuthenticated,
        },
        Mutation: {
            userQuizQuestionUpdateCompleted: graphql_server_1.isAuthenticated,
            deviceNotificationTokenCreate: graphql_server_1.isAuthenticated,
            userUpdateUsername: graphql_server_1.isAuthenticated,
            userUpdateLanguage: graphql_server_1.isAuthenticated,
            accountUpdateDefaultWalletId: graphql_server_1.isAuthenticated,
            userContactUpdateAlias: graphql_server_1.isAuthenticated,
            lnInvoiceFeeProbe: graphql_server_1.isAuthenticated,
            lnNoAmountInvoiceFeeProbe: graphql_server_1.isAuthenticated,
            lnInvoiceCreate: graphql_server_1.isAuthenticated,
            lnUsdInvoiceCreate: graphql_server_1.isAuthenticated,
            lnNoAmountInvoiceCreate: graphql_server_1.isAuthenticated,
            lnInvoicePaymentSend: graphql_server_1.isAuthenticated,
            lnNoAmountInvoicePaymentSend: graphql_server_1.isAuthenticated,
            lnNoAmountUsdInvoicePaymentSend: graphql_server_1.isAuthenticated,
            intraLedgerPaymentSend: graphql_server_1.isAuthenticated,
            intraLedgerUsdPaymentSend: graphql_server_1.isAuthenticated,
            onChainAddressCreate: graphql_server_1.isAuthenticated,
            onChainAddressCurrent: graphql_server_1.isAuthenticated,
            onChainPaymentSend: graphql_server_1.isAuthenticated,
            onChainPaymentSendAll: graphql_server_1.isAuthenticated,
        },
    }, { allowExternalErrors: true });
    const schema = (0, graphql_middleware_1.applyMiddleware)(graphql_1.gqlMainSchema, permissions, wallet_id_1.walletIdMiddleware);
    return (0, graphql_server_1.startApolloServer)({
        schema,
        port: _config_1.GALOY_API_PORT,
        startSubscriptionServer: true,
        type: "main",
    });
}
exports.startApolloServerForCoreSchema = startApolloServerForCoreSchema;
if (require.main === module) {
    (0, mongodb_1.setupMongoConnection)(true)
        .then(async () => {
        (0, health_1.activateLndHealthCheck)();
        await startApolloServerForCoreSchema();
    })
        .catch((err) => graphqlLogger.error(err, "server error"));
}
//# sourceMappingURL=graphql-main-server.js.map