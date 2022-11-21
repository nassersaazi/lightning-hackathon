"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApolloServerForAdminSchema = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const graphql_middleware_1 = require("graphql-middleware");
const graphql_shield_1 = require("graphql-shield");
const logger_1 = require("../services/logger");
const mongodb_1 = require("../services/mongodb");
const health_1 = require("../services/lnd/health");
const _config_1 = require("../config/index");
const graphql_1 = require("../graphql");
const graphql_server_1 = require("./graphql-server");
dotenv_1.default.config();
const graphqlLogger = logger_1.baseLogger.child({ module: "graphql" });
async function startApolloServerForAdminSchema() {
    const permissions = (0, graphql_shield_1.shield)({
        Query: {
            allLevels: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
            accountDetailsByUserPhone: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
            accountDetailsByUsername: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
            transactionById: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
            transactionsByHash: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
            lightningInvoice: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
            lightningPayment: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
            wallet: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
            listWalletIds: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
        },
        Mutation: {
            accountUpdateStatus: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
            accountUpdateLevel: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
            businessUpdateMapInfo: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
            coldStorageRebalanceToHotWallet: (0, graphql_shield_1.and)(graphql_server_1.isAuthenticated, graphql_server_1.isEditor),
        },
    }, { allowExternalErrors: true });
    const schema = (0, graphql_middleware_1.applyMiddleware)(graphql_1.gqlAdminSchema, permissions);
    return (0, graphql_server_1.startApolloServer)({ schema, port: _config_1.GALOY_ADMIN_PORT, type: "admin" });
}
exports.startApolloServerForAdminSchema = startApolloServerForAdminSchema;
if (require.main === module) {
    (0, mongodb_1.setupMongoConnection)()
        .then(async () => {
        (0, health_1.activateLndHealthCheck)();
        await startApolloServerForAdminSchema();
    })
        .catch((err) => graphqlLogger.error(err, "server error"));
}
//# sourceMappingURL=graphql-admin-server.js.map