"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesCache = void 0;
const invoice_expiration_1 = require("../../domain/bitcoin/lightning/invoice-expiration");
const errors_1 = require("../../domain/errors");
const index_1 = require("./index");
const RoutesCache = () => {
    const store = async ({ key, routeToCache, }) => {
        try {
            const value = JSON.stringify(routeToCache);
            await index_1.redis.set(key, value, "EX", invoice_expiration_1.defaultTimeToExpiryInSeconds);
            return routeToCache;
        }
        catch (err) {
            return new errors_1.UnknownRepositoryError(err);
        }
    };
    const findByKey = async (key) => {
        try {
            const rawRouteString = await index_1.redis.get(key);
            if (!rawRouteString)
                return new errors_1.CouldNotFindError("Couldn't find cached route for payment hash");
            return JSON.parse(rawRouteString);
        }
        catch (err) {
            return new errors_1.UnknownRepositoryError(err);
        }
    };
    return {
        store,
        findByKey,
    };
};
exports.RoutesCache = RoutesCache;
//# sourceMappingURL=routes.js.map