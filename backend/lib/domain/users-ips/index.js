"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIps = void 0;
const parseIps = (ips) => {
    if (!ips)
        return undefined;
    if (Array.isArray(ips) && ips.length) {
        return toIpAddress(ips[0]);
    }
    if (typeof ips === "string") {
        if (ips.includes(","))
            return toIpAddress(ips.split(",")[0]);
        return toIpAddress(ips);
    }
    return undefined;
};
exports.parseIps = parseIps;
const toIpAddress = (ip) => {
    if (!ip)
        return undefined;
    const trimmedIp = ip.trim();
    if (!trimmedIp)
        return undefined;
    return trimmedIp;
};
//# sourceMappingURL=index.js.map