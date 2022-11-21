"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwksArgs = exports.decisionsApi = exports.getSwapConfig = exports.getDefaultAccountsConfig = exports.getRewardsConfig = exports.getCaptcha = exports.getKratosConfig = exports.getCronConfig = exports.getTestAccounts = exports.LND_SCB_BACKUP_BUCKET_NAME = exports.getApolloConfig = exports.getIpConfig = exports.PROXY_CHECK_APIKEY = exports.getBuildVersions = exports.getColdStorageConfig = exports.getOnChainWalletConfig = exports.getOnChainAddressCreateAttemptLimits = exports.getInvoiceCreateForRecipientAttemptLimits = exports.getInvoiceCreateAttemptLimits = exports.getFailedLoginAttemptPerIpLimits = exports.getfailedLoginAttemptPerEmailAddressLimits = exports.getFailedLoginAttemptPerPhoneLimits = exports.getRequestPhoneCodePerIpLimits = exports.getRequestPhoneCodePerPhoneMinIntervalLimits = exports.getRequestPhoneCodePerPhoneLimits = exports.getAccountLimits = exports.getFeesConfig = exports.getLndParams = exports.getDealerConfig = exports.getDisplayCurrencyConfig = exports.getI18nInstance = exports.getPubkeysToSkipProbe = exports.getLocale = exports.getLightningAddressDomainAliases = exports.getLightningAddressDomain = exports.getGaloyInstanceName = exports.USER_ACTIVENESS_MONTHLY_VOLUME_THRESHOLD = exports.ONCHAIN_SCAN_DEPTH_CHANNEL_UPDATE = exports.ONCHAIN_SCAN_DEPTH_OUTGOING = exports.ONCHAIN_SCAN_DEPTH = exports.ONCHAIN_MIN_CONFIRMATIONS = exports.MEMO_SHARING_CENTS_THRESHOLD = exports.MEMO_SHARING_SATS_THRESHOLD = exports.RATIO_PRECISION = exports.yamlConfig = exports.yamlConfigInit = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ajv_1 = __importDefault(require("ajv"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const i18n_1 = require("i18n");
const logger_1 = require("../services/logger");
const onchain_1 = require("../domain/bitcoin/onchain");
const bitcoin_1 = require("../domain/bitcoin");
const fiat_1 = require("../domain/fiat");
const wallets_1 = require("../domain/wallets");
const primitives_1 = require("../domain/primitives");
const lightning_1 = require("../domain/bitcoin/lightning");
const shared_1 = require("../domain/shared");
const schema_1 = require("./schema");
const error_1 = require("./error");
const utils_1 = require("./utils");
let customContent, customConfig;
try {
    customContent = fs_1.default.readFileSync("/var/yaml/custom.yaml", "utf8");
    customConfig = js_yaml_1.default.load(customContent);
    logger_1.baseLogger.info("loading custom.yaml");
}
catch (err) {
    logger_1.baseLogger.debug({ err }, "no custom.yaml available. using default values");
}
// TODO: fix errors
// const ajv = new Ajv({ allErrors: true, strict: "log" })
const ajv = new ajv_1.default({ useDefaults: true });
const defaultConfig = {};
const validate = ajv.compile(schema_1.configSchema);
// validate is mutating defaultConfig - even thought it's a const -> it's changing its properties
validate(defaultConfig);
exports.yamlConfigInit = (0, utils_1.merge)(defaultConfig, customConfig);
const valid = validate(exports.yamlConfigInit);
if (!valid) {
    logger_1.baseLogger.error({ validationErrors: validate.errors }, "Invalid yaml configuration");
    throw new error_1.ConfigError("Invalid yaml configuration", validate.errors);
}
exports.yamlConfig = exports.yamlConfigInit;
exports.RATIO_PRECISION = exports.yamlConfig.ratioPrecision;
exports.MEMO_SHARING_SATS_THRESHOLD = exports.yamlConfig.spamLimits
    .memoSharingSatsThreshold;
exports.MEMO_SHARING_CENTS_THRESHOLD = exports.yamlConfig.spamLimits
    .memoSharingCentsThreshold;
// how many block are we looking back for getChainTransactions
const getOnChainScanDepth = (val) => {
    const scanDepth = (0, onchain_1.checkedToScanDepth)(val);
    if (scanDepth instanceof Error)
        throw scanDepth;
    return scanDepth;
};
exports.ONCHAIN_MIN_CONFIRMATIONS = getOnChainScanDepth(exports.yamlConfig.onChainWallet.minConfirmations);
exports.ONCHAIN_SCAN_DEPTH = getOnChainScanDepth(exports.yamlConfig.onChainWallet.scanDepth);
exports.ONCHAIN_SCAN_DEPTH_OUTGOING = getOnChainScanDepth(exports.yamlConfig.onChainWallet.scanDepthOutgoing);
exports.ONCHAIN_SCAN_DEPTH_CHANNEL_UPDATE = getOnChainScanDepth(exports.yamlConfig.onChainWallet.scanDepthChannelUpdate);
exports.USER_ACTIVENESS_MONTHLY_VOLUME_THRESHOLD = (0, fiat_1.toCents)(exports.yamlConfig.userActivenessMonthlyVolumeThreshold);
const getGaloyInstanceName = () => exports.yamlConfig.name;
exports.getGaloyInstanceName = getGaloyInstanceName;
const getLightningAddressDomain = () => exports.yamlConfig.lightningAddressDomain;
exports.getLightningAddressDomain = getLightningAddressDomain;
const getLightningAddressDomainAliases = () => exports.yamlConfig.lightningAddressDomainAliases;
exports.getLightningAddressDomainAliases = getLightningAddressDomainAliases;
const getLocale = () => exports.yamlConfig.locale || "en";
exports.getLocale = getLocale;
const getPubkeysToSkipProbe = () => exports.yamlConfig.skipFeeProbe;
exports.getPubkeysToSkipProbe = getPubkeysToSkipProbe;
const i18n = new i18n_1.I18n();
i18n.configure({
    objectNotation: true,
    updateFiles: false,
    locales: ["en", "es"],
    directory: path_1.default.join(__dirname, "locales"),
});
const getI18nInstance = () => i18n;
exports.getI18nInstance = getI18nInstance;
const getDisplayCurrencyConfig = () => ({
    code: exports.yamlConfig.displayCurrency.code,
    symbol: exports.yamlConfig.displayCurrency.symbol,
});
exports.getDisplayCurrencyConfig = getDisplayCurrencyConfig;
const getDealerConfig = () => exports.yamlConfig.dealer;
exports.getDealerConfig = getDealerConfig;
const getLndParams = () => {
    const lnds = exports.yamlConfig.lnds;
    lnds.forEach((input) => {
        const keys = ["_TLS", "_MACAROON", "_DNS", "_PUBKEY"];
        keys.forEach((key) => {
            if (!process.env[`${input.name}${key}`]) {
                throw new error_1.ConfigError(`lnd params missing for: ${input.name}${key}`);
            }
        });
    });
    return lnds.map((input) => {
        const cert = process.env[`${input.name}_TLS`];
        if (!cert)
            throw new error_1.ConfigError(`missing TLS for ${input.name}`);
        const macaroon = process.env[`${input.name}_MACAROON`];
        if (!macaroon)
            throw new error_1.ConfigError(`missing macaroon for ${input.name}`);
        const node = process.env[`${input.name}_DNS`];
        if (!node)
            throw new error_1.ConfigError(`missing DNS for ${input.name}`);
        const pubkey_ = process.env[`${input.name}_PUBKEY`];
        if (!pubkey_)
            throw new error_1.ConfigError(`missing PUBKEY for ${input.name}`);
        const pubkey = (0, lightning_1.checkedToPubkey)(pubkey_);
        if (pubkey instanceof Error)
            throw new error_1.ConfigError(`wrong PUBKEY formatting for ${input.name}`);
        const port = process.env[`${input.name}_RPCPORT`] ?? 10009;
        const type = input.type.map((item) => item); // TODO: verify if validation is done from yaml.ts
        const priority = input.priority;
        const name = input.name;
        return {
            cert,
            macaroon,
            node,
            port,
            pubkey,
            type,
            priority,
            name,
        };
    });
};
exports.getLndParams = getLndParams;
const getFeesConfig = (feesConfig = exports.yamlConfig.fees) => {
    const method = feesConfig.withdraw.method;
    const withdrawRatio = method === wallets_1.WithdrawalFeePriceMethod.flat ? 0 : feesConfig.withdraw.ratio;
    return {
        depositFeeVariable: feesConfig.deposit,
        depositFeeFixed: (0, bitcoin_1.toSats)(0),
        withdrawMethod: method,
        withdrawRatio,
        withdrawThreshold: (0, bitcoin_1.toSats)(feesConfig.withdraw.threshold),
        withdrawDaysLookback: (0, primitives_1.toDays)(feesConfig.withdraw.daysLookback),
        withdrawDefaultMin: (0, bitcoin_1.toSats)(feesConfig.withdraw.defaultMin),
    };
};
exports.getFeesConfig = getFeesConfig;
const getAccountLimits = ({ level, accountLimits = exports.yamlConfig.accountLimits, }) => {
    return {
        intraLedgerLimit: (0, fiat_1.toCents)(accountLimits.intraLedger.level[level]),
        withdrawalLimit: (0, fiat_1.toCents)(accountLimits.withdrawal.level[level]),
        tradeIntraAccountLimit: (0, fiat_1.toCents)(accountLimits.tradeIntraAccount.level[level]),
    };
};
exports.getAccountLimits = getAccountLimits;
const getRateLimits = (config) => {
    /**
     * Returns a subset of the required parameters for the
     * 'rate-limiter-flexible.RateLimiterRedis' object.
     */
    return {
        points: config.points,
        duration: (0, primitives_1.toSeconds)(config.duration),
        blockDuration: (0, primitives_1.toSeconds)(config.blockDuration),
    };
};
const getRequestPhoneCodePerPhoneLimits = () => getRateLimits(exports.yamlConfig.rateLimits.requestPhoneCodePerPhone);
exports.getRequestPhoneCodePerPhoneLimits = getRequestPhoneCodePerPhoneLimits;
const getRequestPhoneCodePerPhoneMinIntervalLimits = () => getRateLimits(exports.yamlConfig.rateLimits.requestPhoneCodePerPhoneMinInterval);
exports.getRequestPhoneCodePerPhoneMinIntervalLimits = getRequestPhoneCodePerPhoneMinIntervalLimits;
const getRequestPhoneCodePerIpLimits = () => getRateLimits(exports.yamlConfig.rateLimits.requestPhoneCodePerIp);
exports.getRequestPhoneCodePerIpLimits = getRequestPhoneCodePerIpLimits;
const getFailedLoginAttemptPerPhoneLimits = () => getRateLimits(exports.yamlConfig.rateLimits.failedLoginAttemptPerPhone);
exports.getFailedLoginAttemptPerPhoneLimits = getFailedLoginAttemptPerPhoneLimits;
const getfailedLoginAttemptPerEmailAddressLimits = () => getRateLimits(exports.yamlConfig.rateLimits.failedLoginAttemptPerEmailAddress);
exports.getfailedLoginAttemptPerEmailAddressLimits = getfailedLoginAttemptPerEmailAddressLimits;
const getFailedLoginAttemptPerIpLimits = () => getRateLimits(exports.yamlConfig.rateLimits.failedLoginAttemptPerIp);
exports.getFailedLoginAttemptPerIpLimits = getFailedLoginAttemptPerIpLimits;
const getInvoiceCreateAttemptLimits = () => getRateLimits(exports.yamlConfig.rateLimits.invoiceCreateAttempt);
exports.getInvoiceCreateAttemptLimits = getInvoiceCreateAttemptLimits;
const getInvoiceCreateForRecipientAttemptLimits = () => getRateLimits(exports.yamlConfig.rateLimits.invoiceCreateForRecipientAttempt);
exports.getInvoiceCreateForRecipientAttemptLimits = getInvoiceCreateForRecipientAttemptLimits;
const getOnChainAddressCreateAttemptLimits = () => getRateLimits(exports.yamlConfig.rateLimits.onChainAddressCreateAttempt);
exports.getOnChainAddressCreateAttemptLimits = getOnChainAddressCreateAttemptLimits;
const getOnChainWalletConfig = () => ({
    dustThreshold: exports.yamlConfig.onChainWallet.dustThreshold,
});
exports.getOnChainWalletConfig = getOnChainWalletConfig;
const getColdStorageConfig = () => {
    const config = exports.yamlConfig.coldStorage;
    const targetConfirmations = (0, bitcoin_1.checkedToTargetConfs)(config.targetConfirmations);
    if (targetConfirmations instanceof Error)
        throw targetConfirmations;
    return {
        minOnChainHotWalletBalance: (0, bitcoin_1.toSats)(config.minOnChainHotWalletBalance),
        maxHotWalletBalance: (0, bitcoin_1.toSats)(config.maxHotWalletBalance),
        minRebalanceSize: (0, bitcoin_1.toSats)(config.minRebalanceSize),
        walletPattern: config.walletPattern,
        onChainWallet: config.onChainWallet,
        targetConfirmations,
    };
};
exports.getColdStorageConfig = getColdStorageConfig;
const getBuildVersions = () => {
    const { android, ios } = exports.yamlConfig.buildVersion;
    return {
        minBuildNumberAndroid: android.minBuildNumber,
        lastBuildNumberAndroid: android.lastBuildNumber,
        minBuildNumberIos: ios.minBuildNumber,
        lastBuildNumberIos: ios.lastBuildNumber,
    };
};
exports.getBuildVersions = getBuildVersions;
exports.PROXY_CHECK_APIKEY = exports.yamlConfig?.PROXY_CHECK_APIKEY;
const getIpConfig = (config = exports.yamlConfig) => ({
    ipRecordingEnabled: process.env.NODE_ENV === "test" ? false : config.ipRecording?.enabled,
    proxyCheckingEnabled: config.ipRecording?.proxyChecking?.enabled,
});
exports.getIpConfig = getIpConfig;
const getApolloConfig = (config = exports.yamlConfig) => config.apollo;
exports.getApolloConfig = getApolloConfig;
exports.LND_SCB_BACKUP_BUCKET_NAME = exports.yamlConfig.lndScbBackupBucketName;
const getTestAccounts = (config = exports.yamlConfig) => config.test_accounts.map((account) => ({
    phone: account.phone,
    code: account.code,
    username: account.username,
    role: account.role,
}));
exports.getTestAccounts = getTestAccounts;
const getCronConfig = (config = exports.yamlConfig) => config.cronConfig;
exports.getCronConfig = getCronConfig;
const getKratosConfig = (config = exports.yamlConfig) => {
    const kratosConfig = config.kratosConfig;
    const publicApi = process.env.KRATOS_PUBLIC_API ?? kratosConfig.publicApi;
    const adminApi = process.env.KRATOS_ADMIN_API ?? kratosConfig.adminApi;
    return {
        ...kratosConfig,
        publicApi,
        adminApi,
    };
};
exports.getKratosConfig = getKratosConfig;
const getCaptcha = (config = exports.yamlConfig) => config.captcha;
exports.getCaptcha = getCaptcha;
const getRewardsConfig = () => {
    const denyPhoneCountries = exports.yamlConfig.rewards.denyPhoneCountries || [];
    const allowPhoneCountries = exports.yamlConfig.rewards.allowPhoneCountries || [];
    const denyIPCountries = exports.yamlConfig.rewards.denyIPCountries || [];
    const allowIPCountries = exports.yamlConfig.rewards.allowIPCountries || [];
    const denyASNs = exports.yamlConfig.rewards.denyASNs || [];
    const allowASNs = exports.yamlConfig.rewards.allowASNs || [];
    return {
        denyPhoneCountries: denyPhoneCountries.map((c) => c.toUpperCase()),
        allowPhoneCountries: allowPhoneCountries.map((c) => c.toUpperCase()),
        denyIPCountries: denyIPCountries.map((c) => c.toUpperCase()),
        allowIPCountries: allowIPCountries.map((c) => c.toUpperCase()),
        denyASNs: denyASNs.map((c) => c.toUpperCase()),
        allowASNs: allowASNs.map((c) => c.toUpperCase()),
    };
};
exports.getRewardsConfig = getRewardsConfig;
const getDefaultAccountsConfig = (config = exports.yamlConfig) => ({
    initialStatus: config.accounts.initialStatus,
    initialWallets: config.accounts.initialWallets,
});
exports.getDefaultAccountsConfig = getDefaultAccountsConfig;
const getSwapConfig = () => {
    const config = exports.yamlConfig.swap;
    return {
        loopOutWhenHotWalletLessThan: {
            amount: BigInt(config.loopOutWhenHotWalletLessThan),
            currency: shared_1.WalletCurrency.Btc,
        },
        swapOutAmount: { amount: BigInt(config.swapOutAmount), currency: shared_1.WalletCurrency.Btc },
        lnd1loopRestEndpoint: config.lnd1loopRestEndpoint,
        lnd2loopRestEndpoint: config.lnd2loopRestEndpoint,
        lnd1loopRpcEndpoint: config.lnd1loopRpcEndpoint,
        lnd2loopRpcEndpoint: config.lnd2loopRpcEndpoint,
        swapProviders: config.swapProviders,
    };
};
exports.getSwapConfig = getSwapConfig;
const decisionsApi = (config = exports.yamlConfig) => {
    return config.oathkeeperConfig.decisionsApi;
};
exports.decisionsApi = decisionsApi;
const getJwksArgs = (config = exports.yamlConfig) => {
    const urlJkws = config.oathkeeperConfig.urlJkws;
    return {
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: urlJkws,
    };
};
exports.getJwksArgs = getJwksArgs;
//# sourceMappingURL=yaml.js.map