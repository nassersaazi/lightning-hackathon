"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRepositoryError = exports.fromObjectId = exports.toObjectId = void 0;
const errors_1 = require("../../domain/errors");
const mongoose_1 = require("mongoose");
const toObjectId = (id) => {
    return new mongoose_1.Types.ObjectId(id);
};
exports.toObjectId = toObjectId;
const fromObjectId = (id) => {
    return String(id);
};
exports.fromObjectId = fromObjectId;
const parseRepositoryError = (err) => {
    switch (true) {
        case err.message.includes("MongoNetworkTimeoutError: connection timed out"):
        case err.message.includes("MongooseServerSelectionError: connection timed out"):
        case err.message.includes("MongooseServerSelectionError: getaddrinfo ENOTFOUND"):
        case err.message.includes("MongooseServerSelectionError: connect ECONNREFUSED"):
            return new errors_1.CannotConnectToDbError();
        case /connection .+ to .+ closed/.test(err.message):
            return new errors_1.DbConnectionClosedError();
        default:
            return new errors_1.UnknownRepositoryError(err.message);
    }
};
exports.parseRepositoryError = parseRepositoryError;
//# sourceMappingURL=utils.js.map