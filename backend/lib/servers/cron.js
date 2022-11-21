"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tracing_1 = require("../services/tracing");
const utils_1 = require("../services/lnd/utils");
const logger_1 = require("../services/logger");
const mongodb_1 = require("../services/mongodb");
const health_1 = require("../services/lnd/health");
const _app_1 = require("../app/index");
const _config_1 = require("../config/index");
const bitcoin_1 = require("../domain/bitcoin");
const utils_bos_1 = require("../services/lnd/utils-bos");
const auth_1 = require("../app/auth");
const logger = logger_1.baseLogger.child({ module: "cron" });
const rebalance = async () => {
    const result = await _app_1.ColdStorage.rebalanceToColdWallet();
    if (result instanceof Error)
        throw result;
};
const updatePendingLightningInvoices = () => _app_1.Wallets.handleHeldInvoices(logger);
const updatePendingLightningPayments = () => _app_1.Payments.updatePendingPayments(logger);
const updateOnChainReceipt = async () => {
    const txNumber = await _app_1.Wallets.updateOnChainReceipt({ logger });
    if (txNumber instanceof Error)
        throw txNumber;
};
const deleteExpiredInvoices = async () => {
    await (0, utils_1.deleteExpiredWalletInvoice)();
};
const deleteExpiredPaymentFlows = async () => {
    await (0, utils_1.deleteExpiredLightningPaymentFlows)();
};
const updateLnPaymentsCollection = async () => {
    const result = await _app_1.Lightning.updateLnPayments();
    if (result instanceof Error)
        throw result;
};
const deleteLndPaymentsBefore2Months = async () => {
    const timestamp2Months = new Date(Date.now() - _config_1.TWO_MONTHS_IN_MS);
    const result = await _app_1.Lightning.deleteLnPaymentsBefore(timestamp2Months);
    if (result instanceof Error)
        throw result;
};
const swapOutJob = async () => {
    const swapResult = await _app_1.Swap.swapOut();
    if (swapResult instanceof Error)
        throw swapResult;
};
const main = async () => {
    console.log("cronjob started");
    const cronConfig = (0, _config_1.getCronConfig)();
    const results = [];
    const mongoose = await (0, mongodb_1.setupMongoConnection)();
    const tasks = [
        // bitcoin related tasks
        utils_bos_1.reconnectNodes,
        ...(_config_1.BTC_NETWORK != bitcoin_1.BtcNetwork.signet ? [utils_bos_1.rebalancingInternalChannels] : []),
        utils_1.updateEscrows,
        updatePendingLightningInvoices,
        updatePendingLightningPayments,
        updateLnPaymentsCollection,
        utils_1.updateRoutingRevenues,
        updateOnChainReceipt,
        ...(cronConfig.rebalanceEnabled ? [rebalance] : []),
        ...(cronConfig.swapEnabled ? [swapOutJob] : []),
        deleteExpiredPaymentFlows,
        deleteExpiredInvoices,
        deleteLndPaymentsBefore2Months,
        utils_1.deleteFailedPaymentsAttemptAllLnds,
        // auth related tasks
        auth_1.extendSessions,
    ];
    for (const task of tasks) {
        try {
            logger.info(`starting ${task.name}`);
            const wrappedTask = (0, tracing_1.wrapAsyncToRunInSpan)({ namespace: "cron", fn: task });
            await wrappedTask();
            results.push(true);
        }
        catch (error) {
            logger.error({ error }, `issue with task ${task.name}`);
            results.push(false);
        }
    }
    await mongoose.connection.close();
    process.exit(results.every((r) => r) ? 0 : 99);
};
try {
    (0, health_1.activateLndHealthCheck)();
    main();
}
catch (err) {
    logger.warn({ err }, "error in the cron job");
}
//# sourceMappingURL=cron.js.map