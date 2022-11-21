"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserForLogin = void 0;
const _config_1 = require("../../config/index");
const errors_1 = require("../../domain/errors");
const ipfetcher_1 = require("../../domain/ipfetcher");
const ipfetcher_2 = require("../../services/ipfetcher");
const mongoose_1 = require("../../services/mongoose");
const users_ips_1 = require("../../services/mongoose/users-ips");
const tracing_1 = require("../../services/tracing");
const users = (0, mongoose_1.UsersRepository)();
const usersIp = (0, users_ips_1.UsersIpRepository)();
const getUserForLogin = async ({ userId, ip, logger, }) => {
    const user = await users.findById(userId);
    if (user instanceof Error) {
        return user;
    }
    // this routing run asynchrously, to update metadata on the background
    updateUserIPsInfo({ userId, ip, logger });
    return user;
};
exports.getUserForLogin = getUserForLogin;
const updateUserIPsInfo = async ({ userId, ip, logger, }) => (0, tracing_1.asyncRunInSpan)("app.users.updateUserIPsInfo", {
    attributes: {
        [tracing_1.SemanticAttributes.CODE_FUNCTION]: "updateUserIPsInfo",
        [tracing_1.SemanticAttributes.CODE_NAMESPACE]: "app.users",
    },
}, async () => {
    const ipConfig = (0, _config_1.getIpConfig)();
    const lastConnection = new Date();
    const userIP = await usersIp.findById(userId);
    if (userIP instanceof errors_1.RepositoryError)
        return userIP;
    if (!ip || !ipConfig.ipRecordingEnabled) {
        const result = await usersIp.update(userIP);
        if (result instanceof Error) {
            logger.error({ result, userId, ip }, "impossible to update user last connection");
            return result;
        }
        return;
    }
    const lastIP = userIP.lastIPs.find((ipObject) => ipObject.ip === ip);
    if (lastIP) {
        lastIP.lastConnection = lastConnection;
    }
    else {
        let ipInfo = {
            ip,
            firstConnection: lastConnection,
            lastConnection: lastConnection,
        };
        if (ipConfig.proxyCheckingEnabled) {
            const ipFetcher = (0, ipfetcher_2.IpFetcher)();
            const ipFetcherInfo = await ipFetcher.fetchIPInfo(ip);
            if (ipFetcherInfo instanceof ipfetcher_1.IpFetcherServiceError) {
                logger.error({ userId, ip }, "impossible to get ip detail");
                return ipFetcherInfo;
            }
            ipInfo = { ...ipInfo, ...ipFetcherInfo };
        }
        userIP.lastIPs.push(ipInfo);
    }
    const result = await usersIp.update(userIP);
    if (result instanceof Error) {
        logger.error({ result, userId, ip }, "impossible to update ip");
        return result;
    }
});
//# sourceMappingURL=get-user.js.map