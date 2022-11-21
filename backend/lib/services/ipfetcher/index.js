"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpFetcher = void 0;
const axios_1 = __importDefault(require("axios"));
const ipfetcher_1 = require("../../domain/ipfetcher");
const _config_1 = require("../../config/index");
const IpFetcher = () => {
    const fetchIPInfo = async (ip) => {
        try {
            const { data } = await axios_1.default.get(`https://proxycheck.io/v2/${ip}?key=${_config_1.PROXY_CHECK_APIKEY}&vpn=1&asn=1`);
            const proxy = !!(data[ip] && data[ip].proxy && data[ip].proxy === "yes");
            const isoCode = data[ip] && data[ip].isocode;
            return { ...data[ip], isoCode, proxy, status: data.status };
        }
        catch (err) {
            return new ipfetcher_1.UnknownIpFetcherServiceError(err);
        }
    };
    return {
        fetchIPInfo,
    };
};
exports.IpFetcher = IpFetcher;
//# sourceMappingURL=index.js.map