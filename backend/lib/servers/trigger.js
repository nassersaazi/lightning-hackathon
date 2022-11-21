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
exports.setupInvoiceSubscribe = exports.publishSingleCurrentPrice = exports.invoiceUpdateEventHandler = exports.onchainBlockEventHandler = exports.onchainTransactionEventHandler = void 0;
const express_1 = __importDefault(require("express"));
const lightning_1 = require("lightning");
const _config_1 = require("../config/index");
const _app_1 = require("../app/index");
const Wallets = __importStar(require("../app/wallets"));
const backup_1 = require("../app/admin/backup");
const bitcoin_1 = require("../domain/bitcoin");
const cache_1 = require("../domain/cache");
const fiat_1 = require("../domain/fiat");
const shared_1 = require("../domain/shared");
const errors_1 = require("../domain/errors");
const logger_1 = require("../services/logger");
const ledger_1 = require("../services/ledger");
const cache_2 = require("../services/cache");
const utils_1 = require("../services/lnd/utils");
const mongodb_1 = require("../services/mongodb");
const tracing_1 = require("../services/tracing");
const notifications_1 = require("../services/notifications");
const health_1 = require("../services/lnd/health");
const mongoose_1 = require("../services/mongoose");
const lnd_1 = require("../services/lnd");
const loopd_1 = require("../services/loopd");
const get_active_loopd_1 = require("../app/swap/get-active-loopd");
const errors_2 = require("../domain/swap/errors");
const healthz_1 = __importDefault(require("./middlewares/healthz"));
const redisCache = (0, cache_2.RedisCacheService)();
const logger = logger_1.baseLogger.child({ module: "trigger" });
const onchainTransactionEventHandler = async (tx) => {
    logger.info({ tx }, "received new onchain tx event");
    const onchainLogger = logger.child({
        topic: "payment",
        protocol: "onchain",
        tx,
        intraledger: false,
    });
    const fee = tx.fee || 0;
    const txHash = tx.id;
    if (tx.is_outgoing) {
        if (!tx.is_confirmed) {
            return;
            // FIXME
            // we have to return here because we will not know whose user the the txid belong to
            // this is because of limitation for lnd onchain wallet. we only know the txid after the
            // transaction has been sent. and this events is trigger before
        }
        const settled = await (0, ledger_1.LedgerService)().settlePendingOnChainPayment(txHash);
        if (settled instanceof Error) {
            onchainLogger.error({ success: false, settled, transactionType: "payment" }, "payment settle fail");
            return;
        }
        onchainLogger.info({ success: true, pending: false, transactionType: "payment" }, "payment completed");
        // FIXME a tx.id should return a walletId[] instead, in case
        // multiple UXTO goes to the wallet within the same tx
        const walletId = await (0, ledger_1.LedgerService)().getWalletIdByTransactionHash(txHash);
        if (walletId instanceof Error) {
            logger.info({ tx, walletId }, "impossible to find wallet id");
            return;
        }
        let displayPaymentAmount;
        const price = await _app_1.Prices.getCurrentPrice();
        const displayCurrencyPerSat = price instanceof Error ? undefined : price;
        if (displayCurrencyPerSat) {
            const converter = (0, fiat_1.DisplayCurrencyConverter)(displayCurrencyPerSat);
            const amount = converter.fromSats((0, bitcoin_1.toSats)(tx.tokens - fee));
            displayPaymentAmount = { amount, currency: fiat_1.DisplayCurrency.Usd };
        }
        const senderWallet = await (0, mongoose_1.WalletsRepository)().findById(walletId);
        if (senderWallet instanceof Error)
            return senderWallet;
        const senderAccount = await (0, mongoose_1.AccountsRepository)().findById(senderWallet.accountId);
        if (senderAccount instanceof Error)
            return senderAccount;
        const senderUser = await (0, mongoose_1.UsersRepository)().findById(senderAccount.ownerId);
        if (senderUser instanceof Error)
            return senderUser;
        await (0, notifications_1.NotificationsService)().onChainTxSent({
            senderAccountId: senderWallet.accountId,
            senderWalletId: senderWallet.id,
            // TODO: tx.tokens represent the total sum, need to segregate amount by address
            paymentAmount: { amount: BigInt(tx.tokens - fee), currency: senderWallet.currency },
            displayPaymentAmount,
            txHash,
            senderDeviceTokens: senderUser.deviceTokens,
            senderLanguage: senderUser.language,
        });
    }
    else {
        // incoming transaction
        redisCache.clear({ key: cache_1.CacheKeys.LastOnChainTransactions });
        const walletsRepo = (0, mongoose_1.WalletsRepository)();
        const outputAddresses = tx.output_addresses;
        const wallets = await walletsRepo.listByAddresses(outputAddresses);
        if (wallets instanceof Error)
            return;
        // we only handle pending notification here because we wait more than 1 block
        if (!tx.is_confirmed) {
            onchainLogger.info({ transactionType: "receipt", pending: true }, "mempool appearance");
            let displayPaymentAmount;
            const price = await _app_1.Prices.getCurrentPrice();
            const displayCurrencyPerSat = price instanceof Error ? undefined : price;
            if (displayCurrencyPerSat) {
                const converter = (0, fiat_1.DisplayCurrencyConverter)(displayCurrencyPerSat);
                // TODO: tx.tokens represent the total sum, need to segregate amount by address
                const amount = converter.fromSats((0, bitcoin_1.toSats)(tx.tokens));
                displayPaymentAmount = { amount, currency: fiat_1.DisplayCurrency.Usd };
            }
            wallets.forEach(async (wallet) => {
                const recipientAccount = await (0, mongoose_1.AccountsRepository)().findById(wallet.accountId);
                if (recipientAccount instanceof Error)
                    return recipientAccount;
                const recipientUser = await (0, mongoose_1.UsersRepository)().findById(recipientAccount.ownerId);
                if (recipientUser instanceof Error)
                    return recipientUser;
                (0, notifications_1.NotificationsService)().onChainTxReceivedPending({
                    recipientAccountId: wallet.accountId,
                    recipientWalletId: wallet.id,
                    // TODO: tx.tokens represent the total sum, need to segregate amount by address
                    paymentAmount: { amount: BigInt(tx.tokens), currency: wallet.currency },
                    displayPaymentAmount,
                    txHash,
                    recipientDeviceTokens: recipientUser.deviceTokens,
                    recipientLanguage: recipientUser.language,
                });
            });
        }
    }
};
exports.onchainTransactionEventHandler = onchainTransactionEventHandler;
const onchainBlockEventHandler = async (height) => {
    const scanDepth = (_config_1.ONCHAIN_MIN_CONFIRMATIONS + 1);
    const txNumber = await _app_1.Wallets.updateOnChainReceipt({ scanDepth, logger });
    if (txNumber instanceof Error) {
        logger.error({ error: txNumber }, `error updating onchain receipt for block ${height}`);
        return;
    }
    logger.info(`finish block ${height} handler with ${txNumber} transactions`);
};
exports.onchainBlockEventHandler = onchainBlockEventHandler;
const invoiceUpdateEventHandler = async (invoice) => {
    logger.info({ invoice }, "invoiceUpdateEventHandler");
    return invoice.is_held
        ? _app_1.Wallets.updatePendingInvoiceByPaymentHash({
            paymentHash: invoice.id,
            logger,
        })
        : false;
};
exports.invoiceUpdateEventHandler = invoiceUpdateEventHandler;
const publishSingleCurrentPrice = async () => {
    const displayCurrencyPerSat = await _app_1.Prices.getCurrentPrice();
    if (displayCurrencyPerSat instanceof Error) {
        return logger.error({ err: displayCurrencyPerSat }, "can't publish the price");
    }
    (0, notifications_1.NotificationsService)().priceUpdate(displayCurrencyPerSat);
};
exports.publishSingleCurrentPrice = publishSingleCurrentPrice;
const publishCurrentPrice = () => {
    const interval = (1000 * 30);
    return setInterval(async () => {
        await (0, exports.publishSingleCurrentPrice)();
    }, interval);
};
const listenerOnchain = (lnd) => {
    const subTransactions = (0, lightning_1.subscribeToTransactions)({ lnd });
    const onChainTxHandler = (0, tracing_1.wrapAsyncToRunInSpan)({
        root: true,
        namespace: "servers.trigger",
        fn: exports.onchainTransactionEventHandler,
    });
    subTransactions.on("chain_transaction", onChainTxHandler);
    subTransactions.on("error", (err) => {
        logger_1.baseLogger.error({ err }, "error subTransactions");
        (0, tracing_1.recordExceptionInCurrentSpan)({
            error: err,
            level: shared_1.ErrorLevel.Warn,
            attributes: { ["error.subscription"]: "subTransactions" },
        });
    });
    const subBlocks = (0, lightning_1.subscribeToBlocks)({ lnd });
    const onChainBlockHandler = (0, tracing_1.wrapAsyncToRunInSpan)({
        root: true,
        namespace: "servers.trigger",
        fnName: "onchainBlockEventHandler",
        fn: ({ height }) => (0, exports.onchainBlockEventHandler)(height),
    });
    subBlocks.on("block", onChainBlockHandler);
    subBlocks.on("error", (err) => {
        logger_1.baseLogger.error({ err }, "error subBlocks");
        (0, tracing_1.recordExceptionInCurrentSpan)({
            error: err,
            level: shared_1.ErrorLevel.Warn,
            attributes: { ["error.subscription"]: "subBlocks" },
        });
    });
};
const listenerHodlInvoice = ({ lnd, paymentHash, }) => {
    const subInvoice = (0, lightning_1.subscribeToInvoice)({ lnd, id: paymentHash });
    const invoiceUpdateHandler = (0, tracing_1.wrapAsyncToRunInSpan)({
        root: true,
        namespace: "servers.trigger",
        fn: exports.invoiceUpdateEventHandler,
    });
    subInvoice.on("invoice_updated", async (invoice) => {
        if (invoice.is_confirmed || invoice.is_canceled) {
            subInvoice.removeAllListeners();
        }
        else {
            await invoiceUpdateHandler(invoice);
        }
    });
    subInvoice.on("error", (err) => {
        logger_1.baseLogger.info({ err }, "error subChannels");
        (0, tracing_1.recordExceptionInCurrentSpan)({
            error: err,
            level: shared_1.ErrorLevel.Warn,
            attributes: { ["error.subscription"]: "subChannels" },
        });
        subInvoice.removeAllListeners();
    });
};
const listenerExistingHodlInvoices = async ({ lnd, pubkey, }) => {
    const lndService = (0, lnd_1.LndService)();
    if (lndService instanceof Error)
        return lndService;
    const invoices = await lndService.listInvoices(lnd);
    if (invoices instanceof Error)
        return invoices;
    for (const lnInvoice of invoices) {
        if (lnInvoice.isHeld) {
            const walletInvoice = await (0, mongoose_1.WalletInvoicesRepository)().findByPaymentHash(lnInvoice.paymentHash);
            const declineArgs = {
                pubkey,
                paymentHash: lnInvoice.paymentHash,
                logger: logger_1.baseLogger,
            };
            if (walletInvoice instanceof errors_1.CouldNotFindWalletInvoiceError) {
                Wallets.declineHeldInvoice(declineArgs);
                continue;
            }
            if (walletInvoice instanceof Error) {
                continue;
            }
            if (walletInvoice.recipientWalletDescriptor.currency !== shared_1.WalletCurrency.Btc) {
                Wallets.declineHeldInvoice(declineArgs);
                continue;
            }
        }
        if (lnInvoice.isSettled || lnInvoice.isCanceled) {
            continue;
        }
        listenerHodlInvoice({ lnd, paymentHash: lnInvoice.paymentHash });
    }
};
const setupInvoiceSubscribe = ({ lnd, pubkey, subInvoices, }) => {
    subInvoices.on("invoice_updated", (invoice) => 
    // Note: canceled and expired invoices don't come in here, only confirmed check req'd
    !invoice.is_confirmed
        ? listenerHodlInvoice({ lnd, paymentHash: invoice.id })
        : undefined);
    subInvoices.on("error", (err) => {
        logger_1.baseLogger.info({ err }, "error subInvoices");
        (0, tracing_1.recordExceptionInCurrentSpan)({
            error: err,
            level: shared_1.ErrorLevel.Warn,
            attributes: { ["error.subscription"]: "subInvoices" },
        });
        subInvoices.removeAllListeners();
    });
    listenerExistingHodlInvoices({ lnd, pubkey });
};
exports.setupInvoiceSubscribe = setupInvoiceSubscribe;
const listenerOffchain = ({ lnd, pubkey }) => {
    const subInvoices = (0, lightning_1.subscribeToInvoices)({ lnd });
    (0, exports.setupInvoiceSubscribe)({ lnd, pubkey, subInvoices });
    const subChannels = (0, lightning_1.subscribeToChannels)({ lnd });
    subChannels.on("channel_opened", (channel) => (0, utils_1.onChannelUpdated)({ channel, lnd, stateChange: "opened" }));
    subChannels.on("channel_closed", (channel) => (0, utils_1.onChannelUpdated)({ channel, lnd, stateChange: "closed" }));
    subChannels.on("error", (err) => {
        logger_1.baseLogger.info({ err }, "error subChannels");
        (0, tracing_1.recordExceptionInCurrentSpan)({
            error: err,
            level: shared_1.ErrorLevel.Warn,
            attributes: { ["error.subscription"]: "subChannels" },
        });
        subChannels.removeAllListeners();
    });
    const subBackups = (0, lightning_1.subscribeToBackups)({ lnd });
    const newBackupHandler = (0, tracing_1.wrapAsyncToRunInSpan)({
        root: true,
        namespace: "servers.trigger",
        fnName: "uploadBackup",
        fn: ({ backup }) => (0, backup_1.uploadBackup)(logger)({ backup, pubkey }),
    });
    subBackups.on("backup", newBackupHandler);
    subBackups.on("error", (err) => {
        logger_1.baseLogger.info({ err }, "error subBackups");
        (0, tracing_1.recordExceptionInCurrentSpan)({
            error: err,
            level: shared_1.ErrorLevel.Warn,
            attributes: { ["error.subscription"]: "subBackups" },
        });
        subBackups.removeAllListeners();
    });
};
const startSwapMonitor = async (swapService) => {
    const isSwapServerUp = await swapService.healthCheck();
    logger_1.baseLogger.info({ isSwapServerUp }, "isSwapServerUp");
    if (isSwapServerUp) {
        const listener = swapService.swapListener();
        listener.on("data", (response) => {
            logger_1.baseLogger.info({ response }, "Swap Listener Called");
            _app_1.Swap.handleSwapOutCompleted(response);
        });
    }
};
const listenerSwapMonitor = async () => {
    try {
        const loopServiceLnd1 = (0, loopd_1.LoopService)((0, get_active_loopd_1.lnd1LoopConfig)());
        const loopServiceLnd2 = (0, loopd_1.LoopService)((0, get_active_loopd_1.lnd2LoopConfig)());
        startSwapMonitor(loopServiceLnd1);
        startSwapMonitor(loopServiceLnd2);
    }
    catch (e) {
        return new errors_2.SwapTriggerError(e);
    }
};
const main = () => {
    health_1.lndStatusEvent.on("started", ({ lnd, pubkey, socket, type }) => {
        logger_1.baseLogger.info({ socket }, "lnd started");
        if (type.indexOf("onchain") !== -1) {
            listenerOnchain(lnd);
        }
        if (type.indexOf("offchain") !== -1) {
            listenerOffchain({ lnd, pubkey });
        }
    });
    health_1.lndStatusEvent.on("stopped", ({ socket }) => {
        logger_1.baseLogger.info({ socket }, "lnd stopped");
    });
    (0, health_1.activateLndHealthCheck)();
    publishCurrentPrice();
    if ((0, _config_1.getCronConfig)().swapEnabled)
        listenerSwapMonitor();
    console.log("trigger server ready");
};
const healthCheck = () => {
    const app = (0, express_1.default)();
    const port = process.env.PORT || 8888;
    app.get("/healthz", (0, healthz_1.default)({
        checkDbConnectionStatus: true,
        checkRedisStatus: true,
        checkLndsStatus: true,
    }));
    app.listen(port, () => logger.info(`Health check listening on port ${port}!`));
};
// only execute if it is the main module
if (require.main === module) {
    healthCheck();
    (0, mongodb_1.setupMongoConnection)()
        .then(main)
        .catch((err) => logger.error(err));
}
//# sourceMappingURL=trigger.js.map