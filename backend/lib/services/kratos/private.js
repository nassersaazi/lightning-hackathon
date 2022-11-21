"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSessionsInternal = exports.toDomainIdentityPhone = exports.toDomainSession = exports.kratosAdmin = exports.kratosPublic = void 0;
const _config_1 = require("../../config/index");
const errors_1 = require("../../domain/authentication/errors");
const client_1 = require("@ory/client");
const { publicApi, adminApi } = (0, _config_1.getKratosConfig)();
const KratosSdk = (kratosEndpoint) => new client_1.V0alpha2Api(new client_1.Configuration({ basePath: kratosEndpoint }));
exports.kratosPublic = KratosSdk(publicApi);
exports.kratosAdmin = KratosSdk(adminApi);
const toDomainSession = (session) => {
    // is throw ok? this should not happen I (nb) believe but the type say it can
    // this may probably be a type issue in kratos SDK
    if (!session.expires_at)
        throw new errors_1.MissingExpiredAtKratosError();
    return {
        id: session.id,
        identity: (0, exports.toDomainIdentityPhone)(session.identity),
    };
};
exports.toDomainSession = toDomainSession;
const toDomainIdentityPhone = (identity) => ({
    id: identity.id,
    phone: identity.traits.phone,
});
exports.toDomainIdentityPhone = toDomainIdentityPhone;
const listSessionsInternal = async (userId) => {
    try {
        const res = await exports.kratosAdmin.adminListIdentitySessions(userId);
        if (res.data === null)
            return [];
        return res.data;
    }
    catch (err) {
        return new errors_1.UnknownKratosError(err);
    }
};
exports.listSessionsInternal = listSessionsInternal;
//# sourceMappingURL=private.js.map