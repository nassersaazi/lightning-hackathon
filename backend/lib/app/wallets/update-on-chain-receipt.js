"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOnChainReceipt = void 0;
const _config_1 = require("../../config/index");
const prices_1 = require("../prices");
const bitcoin_1 = require("../../domain/bitcoin");
const cache_1 = require("../../domain/cache");
const fiat_1 = require("../../domain/fiat");
const wallets_1 = require("../../domain/wallets");
const onchain_1 = require("../../domain/bitcoin/onchain");
const display_currency_1 = require("../../domain/fiat/display-currency");
const errors_1 = require("../../domain/errors");
const lock_1 = require("../../services/lock");
const ledger_1 = require("../../services/ledger");
const cache_2 = require("../../services/cache");
const cold_storage_1 = require("../../services/cold-storage");
const onchain_service_1 = require("../../services/lnd/onchain-service");
const notifications_1 = require("../../services/notifications");
const mongoose_1 = require("../../services/mongoose");
const redisCache = (0, cache_2.RedisCacheService)();
const updateOnChainReceipt = async ({ scanDepth = _config_1.ONCHAIN_SCAN_DEPTH, logger, }) => {
    const onChain = (0, onchain_service_1.OnChainService)((0, onchain_1.TxDecoder)(_config_1.BTC_NETWORK));
    if (onChain instanceof onchain_1.OnChainError) {
        return onChain;
    }
    const onChainTxs = await onChain.listIncomingTransactions(scanDepth);
    if (onChainTxs instanceof Error)
        return onChainTxs;
    redisCache.set({
        key: cache_1.CacheKeys.LastOnChainTransactions,
        value: onChainTxs,
        ttlSecs: _config_1.SECS_PER_10_MINS,
    });
    const walletRepo = (0, mongoose_1.WalletsRepository)();
    const logError = ({ walletId, txHash, error, }) => {
        logger.error({ walletId, txHash, error }, "Could not updateOnChainReceipt from updateOnChainReceiptForWallet");
    };
    for (const tx of onChainTxs) {
        if (tx.confirmations < _config_1.ONCHAIN_MIN_CONFIRMATIONS)
            continue;
        const txHash = tx.rawTx.txHash;
        const addresses = tx.uniqueAddresses();
        const wallets = await walletRepo.listByAddresses(addresses);
        if (wallets instanceof errors_1.CouldNotFindWalletFromOnChainAddressesError) {
            const result = await processTxForHotWallet({ tx, logger });
            if (result instanceof Error) {
                logger.error({ txHash, error: result }, "Could not updateOnChainReceipt for rebalance tx");
            }
            continue;
        }
        if (wallets instanceof Error) {
            logError({ walletId: undefined, txHash, error: wallets });
            continue;
        }
        for (const wallet of wallets) {
            const walletId = wallet.id;
            logger.trace({ walletId, txHash }, "updating onchain receipt");
            const result = await processTxForWallet(wallet, tx, logger);
            if (result instanceof Error) {
                logError({ walletId, txHash, error: result });
            }
        }
    }
    logger.info(`finish updating onchain receipts with ${onChainTxs.length} transactions`);
    return onChainTxs.length;
};
exports.updateOnChainReceipt = updateOnChainReceipt;
const processTxForWallet = async (wallet, tx, logger) => {
    const notifications = (0, notifications_1.NotificationsService)();
    const ledger = (0, ledger_1.LedgerService)();
    const walletAddresses = wallet.onChainAddresses();
    const displayCurrencyPerSat = await (0, prices_1.getCurrentPrice)();
    if (displayCurrencyPerSat instanceof Error)
        return displayCurrencyPerSat;
    const lockService = (0, lock_1.LockService)();
    return lockService.lockOnChainTxHash(tx.rawTx.txHash, async () => {
        const recorded = await ledger.isOnChainTxRecorded({
            walletId: wallet.id,
            txHash: tx.rawTx.txHash,
        });
        if (recorded instanceof Error) {
            logger.error({ error: recorded }, "Could not query ledger");
            return recorded;
        }
        const account = await (0, mongoose_1.AccountsRepository)().findById(wallet.accountId);
        if (account instanceof Error)
            return account;
        if (!recorded) {
            for (const { sats, address } of tx.rawTx.outs) {
                if (address !== null && walletAddresses.includes(address)) {
                    const fee = (0, wallets_1.DepositFeeCalculator)().onChainDepositFee({
                        amount: sats,
                        ratio: account.depositFeeRatio,
                    });
                    const converter = (0, display_currency_1.DisplayCurrencyConverter)(displayCurrencyPerSat);
                    const amountDisplayCurrency = converter.fromSats(sats);
                    const feeDisplayCurrency = converter.fromSats(fee);
                    const result = await ledger.addOnChainTxReceive({
                        walletId: wallet.id,
                        walletCurrency: wallet.currency,
                        txHash: tx.rawTx.txHash,
                        sats,
                        fee,
                        amountDisplayCurrency,
                        feeDisplayCurrency,
                        receivingAddress: address,
                    });
                    if (result instanceof Error) {
                        logger.error({ error: result }, "Could not record onchain tx in ledger");
                        return result;
                    }
                    const recipientAccount = await (0, mongoose_1.AccountsRepository)().findById(wallet.accountId);
                    if (recipientAccount instanceof Error)
                        return recipientAccount;
                    const recipientUser = await (0, mongoose_1.UsersRepository)().findById(recipientAccount.ownerId);
                    if (recipientUser instanceof Error)
                        return recipientUser;
                    await notifications.onChainTxReceived({
                        recipientAccountId: wallet.accountId,
                        recipientWalletId: wallet.id,
                        paymentAmount: { amount: BigInt(sats), currency: wallet.currency },
                        displayPaymentAmount: {
                            amount: amountDisplayCurrency,
                            currency: fiat_1.DisplayCurrency.Usd,
                        },
                        txHash: tx.rawTx.txHash,
                        recipientDeviceTokens: recipientUser.deviceTokens,
                        recipientLanguage: recipientUser.language,
                    });
                }
            }
        }
    });
};
const processTxForHotWallet = async ({ tx, logger, }) => {
    const coldStorageService = await (0, cold_storage_1.ColdStorageService)();
    if (coldStorageService instanceof Error)
        return coldStorageService;
    const isFromColdStorage = await coldStorageService.isWithdrawalTransaction(tx.rawTx.txHash);
    if (isFromColdStorage instanceof Error)
        return isFromColdStorage;
    if (!isFromColdStorage)
        return;
    const ledger = (0, ledger_1.LedgerService)();
    const displayCurrencyPerSat = await (0, prices_1.getCurrentPrice)();
    if (displayCurrencyPerSat instanceof Error)
        return displayCurrencyPerSat;
    const lockService = (0, lock_1.LockService)();
    return lockService.lockOnChainTxHash(tx.rawTx.txHash, async () => {
        const recorded = await ledger.isToHotWalletTxRecorded(tx.rawTx.txHash);
        if (recorded instanceof Error) {
            logger.error({ error: recorded }, "Could not query ledger");
            return recorded;
        }
        if (recorded)
            return;
        for (const { sats, address } of tx.rawTx.outs) {
            if (address) {
                const isColdStorageAddress = await coldStorageService.isDerivedAddress(address);
                if (isColdStorageAddress instanceof Error || isColdStorageAddress)
                    continue;
                // we can't trust the lnd decoded tx fee because it sets the fee to zero when it's a deposit
                let fee = tx.fee || (await coldStorageService.lookupTransactionFee(tx.rawTx.txHash));
                if (fee instanceof Error)
                    fee = (0, bitcoin_1.toSats)(0);
                const converter = (0, display_currency_1.DisplayCurrencyConverter)(displayCurrencyPerSat);
                const amountDisplayCurrency = converter.fromSats(sats);
                const feeDisplayCurrency = converter.fromSats(fee);
                const description = `deposit to hot wallet of ${sats} sats from the cold storage wallet`;
                const journal = await ledger.addColdStorageTxSend({
                    txHash: tx.rawTx.txHash,
                    description,
                    sats,
                    fee,
                    amountDisplayCurrency,
                    feeDisplayCurrency,
                    payeeAddress: address,
                });
                if (journal instanceof Error) {
                    logger.error({ error: journal }, "Could not record to hot wallet tx in ledger");
                }
            }
        }
    });
};
//# sourceMappingURL=update-on-chain-receipt.js.map