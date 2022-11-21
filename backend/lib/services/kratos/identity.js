"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listIdentities = exports.getNextPage = void 0;
const console_1 = require("console");
const _config_1 = require("../../config/index");
const errors_1 = require("../../domain/authentication/errors");
const private_1 = require("./private");
const getNextPage = (link) => {
    const links = link.split(",");
    const next = links.find((l) => l.includes('rel="next"'));
    if (!next)
        return undefined;
    const nextSplit = next.split("page=");
    const page = +nextSplit[1].replace(/\D+/g, "");
    return page;
};
exports.getNextPage = getNextPage;
// FIXME: there is a bug where page = 0 and page = 1 return the same result
// related bug: https://github.com/ory/kratos/issues/2834
// with 1, only 1 entry will be missing in the result
const perPage = _config_1.isDev ? 3 : 50;
const listIdentities = async () => {
    try {
        const identities = [];
        let totalCount = 0;
        let hasNext = true;
        let page = 0;
        while (hasNext) {
            // Note: this call is paginated, return 250 records `perPage` by default
            const res = await private_1.kratosAdmin.adminListIdentities(perPage, page);
            identities.push(...res.data);
            totalCount = Number(res.headers["x-total-count"]);
            page = (0, exports.getNextPage)(res.headers.link);
            hasNext = page !== undefined && totalCount !== 0;
        }
        // FIXME(nb) function above return duplicated query for the first 2 calls, so removing them here
        const uniqueIdentities = identities.filter((value, index, self) => index === self.findIndex((t) => t.id === value.id));
        (0, console_1.assert)(totalCount == uniqueIdentities.length);
        return uniqueIdentities.map(private_1.toDomainIdentityPhone);
    }
    catch (err) {
        return new errors_1.UnknownKratosError(err);
    }
};
exports.listIdentities = listIdentities;
//# sourceMappingURL=identity.js.map