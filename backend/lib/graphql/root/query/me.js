"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const graphql_user_1 = __importDefault(require("../../types/object/graphql-user"));
const MeQuery = index_1.GT.Field({
    type: graphql_user_1.default,
    resolve: async (_, __, { domainUser, domainAccount }) => ({
        ...domainUser,
        quizQuestions: domainAccount?.quizQuestions,
    }),
});
exports.default = MeQuery;
//# sourceMappingURL=me.js.map