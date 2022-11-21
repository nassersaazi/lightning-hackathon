"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKratosMasterPhonePassword = exports.getLoopConfig = exports.LND_HEALTH_REFRESH_TIME_MS = exports.getBitcoinCoreRPCConfig = exports.Nextcloudpassword = exports.Nextclouduser = exports.Nextcloudurl = exports.GcsApplicationCredentials = exports.DropboxAccessToken = exports.isRunningJest = exports.isDev = exports.isProd = exports.getDealerPriceConfig = exports.getTwilioConfig = exports.getGeetestConfig = exports.getGaloyBuildInformation = exports.tracingConfig = exports.BTC_NETWORK = exports.JWT_SECRET = exports.GALOY_ADMIN_PORT = exports.GALOY_API_PORT = void 0;
const yaml_1 = require("./yaml");
const error_1 = require("./error");
exports.GALOY_API_PORT = process.env.GALOY_API_PORT || 4012;
exports.GALOY_ADMIN_PORT = process.env.GALOY_ADMIN_PORT || 4001;
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new error_1.ConfigError("missing JWT_SECRET");
}
exports.JWT_SECRET = jwtSecret;
const btcNetwork = process.env.NETWORK;
const networks = ["mainnet", "testnet", "signet", "regtest"];
if (!!btcNetwork && !networks.includes(btcNetwork)) {
    throw new error_1.ConfigError(`missing or invalid NETWORK: ${btcNetwork}`);
}
exports.BTC_NETWORK = btcNetwork;
exports.tracingConfig = {
    jaegerHost: process.env.JAEGER_HOST || "localhost",
    jaegerPort: parseInt(process.env.JAEGER_PORT || "6832", 10),
    tracingServiceName: process.env.TRACING_SERVICE_NAME || "galoy-dev",
};
const getGaloyBuildInformation = () => {
    return {
        commitHash: process.env.COMMITHASH,
        buildTime: process.env.BUILDTIME,
        helmRevision: process.env.HELMREVISION,
    };
};
exports.getGaloyBuildInformation = getGaloyBuildInformation;
const getGeetestConfig = () => {
    // FIXME: Geetest should be optional.
    if (!process.env.GEETEST_ID || !process.env.GEETEST_KEY) {
        throw new error_1.ConfigError("Geetest config not found");
    }
    const config = {
        id: process.env.GEETEST_ID,
        key: process.env.GEETEST_KEY,
    };
    return config;
};
exports.getGeetestConfig = getGeetestConfig;
const getTwilioConfig = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!accountSid || !authToken || !twilioPhoneNumber) {
        throw new error_1.ConfigError("missing key for twilio");
    }
    return {
        accountSid,
        authToken,
        twilioPhoneNumber,
    };
};
exports.getTwilioConfig = getTwilioConfig;
const getDealerPriceConfig = () => {
    return {
        port: process.env.PRICE_SERVER_PORT ?? "3325",
        host: process.env.PRICE_SERVER_HOST ?? "localhost",
    };
};
exports.getDealerPriceConfig = getDealerPriceConfig;
// FIXME: we have process.env.NODE_ENV === "production" | "development" | "test"
// "test" might not be needed
exports.isProd = process.env.NODE_ENV === "production";
exports.isDev = process.env.NODE_ENV === "development";
exports.isRunningJest = typeof jest !== "undefined";
exports.DropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;
exports.GcsApplicationCredentials = process.env.GCS_APPLICATION_CREDENTIALS;
exports.Nextcloudurl = process.env.NEXTCLOUD_URL;
exports.Nextclouduser = process.env.NEXTCLOUD_USER;
exports.Nextcloudpassword = process.env.NEXTCLOUD_PASSWORD;
const getBitcoinCoreRPCConfig = () => {
    return {
        network: process.env.NETWORK,
        username: process.env.BITCOINDRPCUSER || "rpcuser",
        password: process.env.BITCOINDRPCPASS,
        host: process.env.BITCOINDADDR,
        port: process.env.BITCOINDPORT,
        version: "0.22.0",
    };
};
exports.getBitcoinCoreRPCConfig = getBitcoinCoreRPCConfig;
exports.LND_HEALTH_REFRESH_TIME_MS = parseInt(process.env.LND_HEALTH_REFRESH_TIME_MS || "20000", 10);
const getLoopConfig = () => {
    if ((0, yaml_1.getCronConfig)().swapEnabled) {
        if (!process.env.LND1_LOOP_TLS)
            throw new error_1.ConfigError("Missing LND1_LOOP_TLS config");
        if (!process.env.LND2_LOOP_TLS)
            throw new error_1.ConfigError("Missing LND2_LOOP_TLS config");
        if (!process.env.LND1_LOOP_MACAROON)
            throw new error_1.ConfigError("Missing LND1_LOOP_MACAROON config");
        if (!process.env.LND2_LOOP_MACAROON)
            throw new error_1.ConfigError("Missing LND2_LOOP_MACAROON config");
        return {
            lnd1LoopTls: process.env.LND1_LOOP_TLS,
            lnd1LoopMacaroon: process.env.LND1_LOOP_MACAROON,
            lnd2LoopTls: process.env.LND2_LOOP_TLS,
            lnd2LoopMacaroon: process.env.LND2_LOOP_MACAROON,
        };
    }
    throw new error_1.ConfigError("getLoopConfig() was called though swapEnabled is false");
};
exports.getLoopConfig = getLoopConfig;
const getKratosMasterPhonePassword = () => {
    if (!process.env.KRATOS_MASTER_PHONE_PASSWORD) {
        throw new error_1.ConfigError("KRATOS_MASTER_PHONE_PASSWORD env not found");
    }
    return process.env.KRATOS_MASTER_PHONE_PASSWORD;
};
exports.getKratosMasterPhonePassword = getKratosMasterPhonePassword;
//# sourceMappingURL=process.js.map