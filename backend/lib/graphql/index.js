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
exports.GT = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const graphql_1 = require("graphql");
// GraphQL Types
exports.GT = {
    ID: graphql_1.GraphQLID,
    String: graphql_1.GraphQLString,
    Int: graphql_1.GraphQLInt,
    Boolean: graphql_1.GraphQLBoolean,
    Float: graphql_1.GraphQLFloat,
    Field: (config) => config,
    Interface: (arg) => new graphql_1.GraphQLInterfaceType(arg),
    Union: (arg) => new graphql_1.GraphQLUnionType(arg),
    Scalar: (arg) => new graphql_1.GraphQLScalarType(arg),
    Enum: (arg) => new graphql_1.GraphQLEnumType(arg),
    Object: (arg) => new graphql_1.GraphQLObjectType(arg),
    Input: (arg) => new graphql_1.GraphQLInputObjectType(arg),
    NonNull: (arg) => new graphql_1.GraphQLNonNull(arg),
    List: (arg) => new graphql_1.GraphQLList(arg),
    // Commonly-used Non-nulls
    NonNullID: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID),
    NonNullList: (arg) => new graphql_1.GraphQLNonNull(new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(arg))),
    Kind: graphql_1.Kind,
};
__exportStar(require("./main/index"), exports);
__exportStar(require("./admin/index"), exports);
//# sourceMappingURL=index.js.map