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
exports.gqlAdminSchema = void 0;
const graphql_1 = require("graphql");
const _config_1 = require("../../config/index");
const queries_1 = __importDefault(require("./queries"));
const mutations_1 = __importDefault(require("./mutations"));
const types_1 = require("./types");
if (_config_1.isDev && !_config_1.isRunningJest) {
    Promise.resolve().then(() => __importStar(require("../../services/fs"))).then(({ writeSDLFile }) => {
        writeSDLFile(__dirname + "/schema.graphql", (0, graphql_1.printSchema)((0, graphql_1.lexicographicSortSchema)(exports.gqlAdminSchema)));
    });
}
exports.gqlAdminSchema = new graphql_1.GraphQLSchema({
    query: queries_1.default,
    mutation: mutations_1.default,
    types: types_1.ALL_INTERFACE_TYPES,
});
//# sourceMappingURL=index.js.map