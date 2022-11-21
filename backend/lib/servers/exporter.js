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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingVersusRealWorldAssets = void 0;
const express_1 = __importDefault(require("express"));
const prom_client_1 = __importStar(require("prom-client"));
const logger_1 = require("../services/logger");
const mongodb_1 = require("../services/mongodb");
const health_1 = require("../services/lnd/health");
const tracing_1 = require("../services/tracing");
const schema_1 = require("../services/mongoose/schema");
const ledger_1 = require("../services/ledger");
const utils_1 = require("../services/lnd/utils");
const bitcoind_1 = require("../services/bitcoind");
const caching_1 = require("../services/ledger/caching");
const _app_1 = require("../app/index");
const _config_1 = require("../config/index");
const cache_1 = require("../services/cache");
const primitives_1 = require("../domain/primitives");
const _utils_1 = require("../utils/index");
const healthz_1 = __importDefault(require("./middlewares/healthz"));
const TIMEOUT_WALLET_BALANCE = 30000;
const logger = logger_1.baseLogger.child({ module: "exporter" });
const prefix = "galoy";
const main = async () => {
    const { getLiabilitiesBalance, getLndBalance, getBitcoindBalance } = mongodb_1.ledgerAdmin;
    createGauge({
        name: "liabilities",
        description: "how much money customers has",
        collect: getLiabilitiesBalance,
    });
    createGauge({
        name: "lightning",
        description: "how much money there is our books for lnd",
        collect: getLndBalance,
    });
    createGauge({
        name: "userCount",
        description: "how much users have registered",
        collect: async () => {
            const value = await schema_1.User.countDocuments();
            return value;
        },
    });
    createGauge({
        name: "lnd",
        description: "how much money in our node",
        collect: async () => {
            const balance = await _app_1.Lightning.getTotalBalance();
            if (balance instanceof Error)
                return 0;
            return balance;
        },
    });
    createGauge({
        name: "lnd_onchain",
        description: "how much fund is onChain in our nodes",
        collect: async () => {
            const balance = await _app_1.Lightning.getOnChainBalance();
            if (balance instanceof Error)
                return 0;
            return balance;
        },
    });
    createGauge({
        name: "lnd_offchain",
        description: "how much fund is offChain in our nodes",
        collect: async () => {
            const balance = await _app_1.Lightning.getOffChainBalance();
            if (balance instanceof Error)
                return 0;
            return balance;
        },
    });
    createGauge({
        name: "lnd_openingchannelbalance",
        description: "how much fund is pending following opening channel",
        collect: async () => {
            const balance = await _app_1.Lightning.getOpeningChannelBalance();
            if (balance instanceof Error)
                return 0;
            return balance;
        },
    });
    createGauge({
        name: "lnd_closingchannelbalance",
        description: "how much fund is closing following force closed channel",
        collect: async () => {
            const balance = await _app_1.Lightning.getClosingChannelBalance();
            if (balance instanceof Error)
                return 0;
            return balance;
        },
    });
    createGauge({
        name: "assetsEqLiabilities",
        description: "do we have a balanced book",
        collect: getAssetsLiabilitiesDifference,
    });
    createGauge({
        name: "lndBalanceSync",
        description: "are lnd in syncs with our books",
        collect: exports.getBookingVersusRealWorldAssets,
    });
    createGauge({
        name: "bos",
        description: "bos score",
        collect: utils_1.getBosScore,
    });
    createGauge({
        name: "bitcoin",
        description: "amount in accounting for cold storage",
        collect: getBitcoindBalance,
    });
    createGauge({
        name: "business",
        description: "number of businesses in the app",
        collect: async () => {
            const value = await schema_1.User.countDocuments({ title: { $ne: undefined } });
            return value;
        },
    });
    const galoyWallets = [
        { name: "dealer_btc", getId: caching_1.getDealerBtcWalletId },
        { name: "dealer_usd", getId: caching_1.getDealerUsdWalletId },
        { name: "funder", getId: caching_1.getFunderWalletId },
        { name: "bankowner", getId: caching_1.getBankOwnerWalletId },
    ];
    for (const wallet of galoyWallets) {
        createWalletGauge({ walletName: wallet.name, getId: wallet.getId });
    }
    const coldStorageWallets = await _app_1.ColdStorage.listWallets();
    if (!(coldStorageWallets instanceof Error)) {
        for (const walletName of coldStorageWallets) {
            createColdStorageWalletGauge(walletName);
        }
    }
    const server = (0, express_1.default)();
    server.get("/metrics", async (req, res) => (0, tracing_1.asyncRunInSpan)("metrics", {}, async () => {
        res.set("Content-Type", prom_client_1.register.contentType);
        res.end(await prom_client_1.register.metrics());
    }));
    server.get("/healthz", (0, healthz_1.default)({
        checkDbConnectionStatus: true,
        checkRedisStatus: false,
        checkLndsStatus: true,
    }));
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        logger.info(`Server listening to ${port}, metrics exposed on /metrics endpoint`);
    });
    (0, health_1.activateLndHealthCheck)();
};
(0, mongodb_1.setupMongoConnection)()
    .then(() => main())
    .catch((err) => logger.error(err));
const createGauge = ({ name, description, collect, }) => {
    const collectFn = (0, tracing_1.wrapAsyncToRunInSpan)({
        namespace: "exporter",
        fnName: name,
        fn: collect,
    });
    return new prom_client_1.default.Gauge({
        name: `${prefix}_${name}`,
        help: description,
        async collect() {
            const value = await collectFn();
            (0, tracing_1.addAttributesToCurrentSpan)({ [`${name}_value`]: `${value}` });
            this.set(value);
        },
    });
};
const cache = (0, cache_1.LocalCacheService)();
const createWalletGauge = ({ walletName, getId, }) => {
    const name = `${walletName}_balance`;
    const description = `${walletName} balance`;
    return createGauge({
        name,
        description,
        collect: async () => {
            const getWalletBalancePromise = async () => {
                const walletId = await getId();
                return getWalletBalance(walletId);
            };
            try {
                const timeoutPromise = (0, _utils_1.timeout)(TIMEOUT_WALLET_BALANCE, "Timeout");
                const balance = (await Promise.race([
                    getWalletBalancePromise(),
                    timeoutPromise,
                ]));
                await cache.set({
                    key: name,
                    value: balance,
                    ttlSecs: (0, primitives_1.toSeconds)(_config_1.SECS_PER_5_MINS * 3),
                });
                return balance;
            }
            catch (err) {
                logger.error({ err }, `Could not load wallet id for ${walletName}.`);
                if (err.message === "Timeout")
                    logger.info(`Getting ${walletName} wallet balance from cache.`);
                return cache.getOrSet({
                    key: name,
                    ttlSecs: (0, primitives_1.toSeconds)(_config_1.SECS_PER_5_MINS * 3),
                    getForCaching: getWalletBalancePromise,
                });
            }
        },
    });
};
const getWalletBalance = async (walletId) => {
    const walletBalance = await (0, ledger_1.LedgerService)().getWalletBalance(walletId);
    if (walletBalance instanceof Error) {
        logger.warn({ walletId, walletBalance }, "impossible to get balance");
        return 0;
    }
    return walletBalance;
};
const createColdStorageWalletGauge = (walletName) => {
    const walletNameSanitized = walletName.replace("/", "_");
    const name = `bitcoind_${walletNameSanitized}`;
    const description = `amount in wallet ${walletNameSanitized}`;
    return createGauge({
        name,
        description,
        collect: async () => {
            const balance = await _app_1.ColdStorage.getBalance(walletName);
            if (balance instanceof Error) {
                logger.error({ walletName }, "error getting bitcoind/specter balance");
                return 0;
            }
            return balance.amount;
        },
    });
};
const getAssetsLiabilitiesDifference = async () => {
    const [assets, liabilities] = await Promise.all([
        mongodb_1.ledgerAdmin.getAssetsBalance(),
        mongodb_1.ledgerAdmin.getLiabilitiesBalance(),
    ]);
    return assets + liabilities;
};
const getBookingVersusRealWorldAssets = async () => {
    const [lightning, bitcoin, lndBalance, bitcoind] = await Promise.all([
        mongodb_1.ledgerAdmin.getLndBalance(),
        mongodb_1.ledgerAdmin.getBitcoindBalance(),
        _app_1.Lightning.getTotalBalance(),
        (0, bitcoind_1.getBalance)(),
    ]);
    const lnd = lndBalance instanceof Error ? 0 : lndBalance;
    return (lnd + // physical assets
        bitcoind + // physical assets
        (lightning + bitcoin)); // value in accounting
};
exports.getBookingVersusRealWorldAssets = getBookingVersusRealWorldAssets;
//# sourceMappingURL=exporter.js.map