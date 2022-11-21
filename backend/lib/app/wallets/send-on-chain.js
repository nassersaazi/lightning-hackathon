"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payOnChainByWalletId = void 0;
const crypto_1 = __importDefault(require("crypto"));
const _config_1 = require("../../config/index");
const prices_1 = require("../prices");
const fiat_1 = require("../../domain/fiat");
const shared_1 = require("../../domain/shared");
const lightning_1 = require("../../domain/bitcoin/lightning");
const lock_1 = require("../../domain/lock");
const display_currency_1 = require("../../domain/fiat/display-currency");
const imbalance_calculator_1 = require("../../domain/ledger/imbalance-calculator");
const bitcoin_1 = require("../../domain/bitcoin");
const wallets_1 = require("../../domain/wallets");
const errors_1 = require("../../domain/errors");
const onchain_1 = require("../../domain/bitcoin/onchain");
const lock_2 = require("../../services/lock");
const logger_1 = require("../../services/logger");
const ledger_1 = require("../../services/ledger");
const onchain_service_1 = require("../../services/lnd/onchain-service");
const tracing_1 = require("../../services/tracing");
const notifications_1 = require("../../services/notifications");
const mongoose_1 = require("../../services/mongoose");
const check_limit_helpers_1 = require("./private/check-limit-helpers");
const get_on_chain_fee_1 = require("./get-on-chain-fee");
const { dustThreshold } = (0, _config_1.getOnChainWalletConfig)();
const payOnChainByWalletId = async ({ senderAccount, senderWalletId, amount: amountRaw, address, targetConfirmations, memo, sendAll, }) => {
    const checkedAmount = sendAll
        ? await (0, ledger_1.LedgerService)().getWalletBalance(senderWalletId)
        : (0, bitcoin_1.checkedToSats)(amountRaw);
    if (checkedAmount instanceof Error)
        return checkedAmount;
    const validator = (0, wallets_1.PaymentInputValidator)((0, mongoose_1.WalletsRepository)().findById);
    const validationResult = await validator.validatePaymentInput({
        amount: checkedAmount,
        senderAccount,
        senderWalletId,
    });
    if (validationResult instanceof Error)
        return validationResult;
    const { amount, senderWallet } = validationResult;
    const onchainLogger = logger_1.baseLogger.child({
        topic: "payment",
        protocol: "onchain",
        transactionType: "payment",
        address,
        amount,
        memo,
        sendAll,
    });
    const checkedAddress = (0, onchain_1.checkedToOnChainAddress)({
        network: _config_1.BTC_NETWORK,
        value: address,
    });
    if (checkedAddress instanceof Error)
        return checkedAddress;
    const checkedTargetConfirmations = (0, bitcoin_1.checkedToTargetConfs)(targetConfirmations);
    if (checkedTargetConfirmations instanceof Error)
        return checkedTargetConfirmations;
    const wallets = (0, mongoose_1.WalletsRepository)();
    const recipientWallet = await wallets.findByAddress(checkedAddress);
    const isIntraLedger = !(recipientWallet instanceof Error);
    if (isIntraLedger)
        return executePaymentViaIntraledger({
            senderAccount,
            senderWallet,
            recipientWallet,
            amount,
            address: checkedAddress,
            memo,
            sendAll,
            logger: onchainLogger,
        });
    return executePaymentViaOnChain({
        senderWallet,
        senderAccount,
        amount,
        address: checkedAddress,
        targetConfirmations: checkedTargetConfirmations,
        memo,
        sendAll,
        logger: onchainLogger,
    });
};
exports.payOnChainByWalletId = payOnChainByWalletId;
const executePaymentViaIntraledger = async ({ senderAccount, senderWallet, recipientWallet, amount, address, memo, sendAll, logger, }) => {
    if (recipientWallet.id === senderWallet.id)
        return new errors_1.SelfPaymentError();
    // TODO Usd use case
    if (!(recipientWallet.currency === shared_1.WalletCurrency.Btc &&
        senderWallet.currency === shared_1.WalletCurrency.Btc)) {
        return new errors_1.NotImplementedError("USD intraledger");
    }
    const amountSats = (0, bitcoin_1.toSats)(amount);
    const displayCurrencyPerSat = await (0, prices_1.getCurrentPrice)();
    if (displayCurrencyPerSat instanceof Error)
        return displayCurrencyPerSat;
    const dCConverter = (0, display_currency_1.DisplayCurrencyConverter)(displayCurrencyPerSat);
    const intraledgerLimitCheck = await (0, check_limit_helpers_1.checkIntraledgerLimits)({
        amount,
        dCConverter,
        walletId: senderWallet.id,
        walletCurrency: senderWallet.currency,
        account: senderAccount,
    });
    if (intraledgerLimitCheck instanceof Error)
        return intraledgerLimitCheck;
    const amountDisplayCurrency = dCConverter.fromSats(amountSats);
    const recipientAccount = await (0, mongoose_1.AccountsRepository)().findById(recipientWallet.accountId);
    if (recipientAccount instanceof Error)
        return recipientAccount;
    return (0, lock_2.LockService)().lockWalletId(senderWallet.id, async (signal) => {
        const balance = await (0, ledger_1.LedgerService)().getWalletBalance(senderWallet.id);
        if (balance instanceof Error)
            return balance;
        if (balance < amount)
            return new errors_1.InsufficientBalanceError(`Payment amount '${amount}' exceeds balance '${balance}'`);
        const onchainLoggerOnUs = logger.child({ balance, onUs: true });
        if (signal.aborted) {
            return new lock_1.ResourceExpiredLockServiceError(signal.error?.message);
        }
        const journal = await (0, ledger_1.LedgerService)().addOnChainIntraledgerTxTransfer({
            senderWalletId: senderWallet.id,
            senderWalletCurrency: senderWallet.currency,
            senderUsername: senderAccount.username,
            description: "",
            sats: amountSats,
            amountDisplayCurrency,
            payeeAddresses: [address],
            sendAll,
            recipientWalletId: recipientWallet.id,
            recipientWalletCurrency: recipientWallet.currency,
            recipientUsername: recipientAccount.username,
            memoPayer: memo || undefined,
        });
        if (journal instanceof Error)
            return journal;
        const recipientUser = await (0, mongoose_1.UsersRepository)().findById(recipientAccount.ownerId);
        if (recipientUser instanceof Error)
            return recipientUser;
        const displayPaymentAmount = {
            amount: amountDisplayCurrency,
            currency: fiat_1.DisplayCurrency.Usd,
        };
        const notificationsService = (0, notifications_1.NotificationsService)();
        notificationsService.intraLedgerTxReceived({
            recipientAccountId: recipientWallet.accountId,
            recipientWalletId: recipientWallet.id,
            recipientDeviceTokens: recipientUser.deviceTokens,
            recipientLanguage: recipientUser.language,
            paymentAmount: { amount: BigInt(amountSats), currency: recipientWallet.currency },
            displayPaymentAmount,
        });
        onchainLoggerOnUs.info({
            success: true,
            type: "onchain_on_us",
            pending: false,
            amountDisplayCurrency,
        }, "onchain payment succeed");
        return lightning_1.PaymentSendStatus.Success;
    });
};
const executePaymentViaOnChain = async ({ senderWallet, senderAccount, amount, address, targetConfirmations, memo, sendAll, logger, }) => {
    // TODO Usd use case
    if (senderWallet.currency !== shared_1.WalletCurrency.Btc) {
        return new errors_1.NotImplementedError("USD Intraledger");
    }
    const amountSats = (0, bitcoin_1.toSats)(amount);
    const ledgerService = (0, ledger_1.LedgerService)();
    const feeConfig = (0, _config_1.getFeesConfig)();
    const withdrawFeeCalculator = (0, wallets_1.WithdrawalFeeCalculator)({
        feeRatio: feeConfig.withdrawRatio,
        thresholdImbalance: feeConfig.withdrawThreshold,
    });
    const onChainService = (0, onchain_service_1.OnChainService)((0, onchain_1.TxDecoder)(_config_1.BTC_NETWORK));
    if (onChainService instanceof Error)
        return onChainService;
    const displayCurrencyPerSat = await (0, prices_1.getCurrentPrice)();
    if (displayCurrencyPerSat instanceof Error)
        return displayCurrencyPerSat;
    const dCConverter = (0, display_currency_1.DisplayCurrencyConverter)(displayCurrencyPerSat);
    const withdrawalLimitCheck = await (0, check_limit_helpers_1.checkWithdrawalLimits)({
        amount,
        dCConverter,
        walletId: senderWallet.id,
        walletCurrency: senderWallet.currency,
        account: senderAccount,
    });
    if (withdrawalLimitCheck instanceof Error)
        return withdrawalLimitCheck;
    const getFeeEstimate = () => (0, get_on_chain_fee_1.getOnChainFee)({
        walletId: senderWallet.id,
        account: senderAccount,
        amount,
        address,
        targetConfirmations,
    });
    const onChainAvailableBalance = await onChainService.getBalance();
    if (onChainAvailableBalance instanceof Error)
        return onChainAvailableBalance;
    const estimatedFee = await getFeeEstimate();
    if (estimatedFee instanceof Error)
        return estimatedFee;
    const amountToSend = sendAll ? (0, bitcoin_1.toSats)(amount - estimatedFee) : amountSats;
    if (onChainAvailableBalance < amountToSend + estimatedFee)
        return new errors_1.RebalanceNeededError();
    if (amountToSend < dustThreshold)
        return new errors_1.LessThanDustThresholdError(`Use lightning to send amounts less than ${dustThreshold}`);
    return (0, lock_2.LockService)().lockWalletId(senderWallet.id, async (signal) => {
        const balance = await (0, ledger_1.LedgerService)().getWalletBalance(senderWallet.id);
        if (balance instanceof Error)
            return balance;
        const estimatedFee = await getFeeEstimate();
        if (estimatedFee instanceof Error)
            return estimatedFee;
        if (balance < amountToSend + estimatedFee) {
            return new errors_1.InsufficientBalanceError(`${amountToSend + estimatedFee} exceeds balance ${balance}`);
        }
        if (signal.aborted) {
            return new lock_1.ResourceExpiredLockServiceError(signal.error?.message);
        }
        const imbalanceCalculator = (0, imbalance_calculator_1.ImbalanceCalculator)({
            method: feeConfig.withdrawMethod,
            volumeLightningFn: (0, ledger_1.LedgerService)().lightningTxBaseVolumeSince,
            volumeOnChainFn: (0, ledger_1.LedgerService)().onChainTxBaseVolumeSince,
            sinceDaysAgo: feeConfig.withdrawDaysLookback,
        });
        const imbalance = await imbalanceCalculator.getSwapOutImbalance(senderWallet.id);
        if (imbalance instanceof Error)
            return imbalance;
        const minerFee = await onChainService.getOnChainFeeEstimate({
            amount: amountToSend,
            address,
            targetConfirmations,
        });
        if (minerFee instanceof Error)
            return minerFee;
        const fees = withdrawFeeCalculator.onChainWithdrawalFee({
            amount: amountToSend,
            minerFee,
            minBankFee: (0, bitcoin_1.toSats)(senderAccount.withdrawFee || feeConfig.withdrawDefaultMin),
            imbalance,
        });
        const totalFee = fees.totalFee;
        const bankFee = fees.bankFee;
        const sats = (0, bitcoin_1.toSats)(amountToSend + totalFee);
        const amountDisplayCurrency = dCConverter.fromSats(sats);
        const totalFeeDisplayCurrency = dCConverter.fromSats(totalFee);
        (0, tracing_1.addAttributesToCurrentSpan)({
            "payOnChainByWalletId.estimatedFee": `${estimatedFee}`,
            "payOnChainByWalletId.estimatedMinerFee": `${minerFee}`,
            "payOnChainByWalletId.totalFee": `${totalFee}`,
            "payOnChainByWalletId.bankFee": `${bankFee}`,
        });
        const journal = await ledgerService.addOnChainTxSend({
            walletId: senderWallet.id,
            walletCurrency: senderWallet.currency,
            // we need a temporary hash to be able to search in admin panel
            txHash: crypto_1.default.randomBytes(32).toString("hex"),
            description: memo || "",
            sats,
            totalFee,
            bankFee,
            amountDisplayCurrency,
            payeeAddress: address,
            sendAll,
            totalFeeDisplayCurrency,
        });
        if (journal instanceof Error)
            return journal;
        const txHash = await onChainService.payToAddress({
            address,
            amount: amountToSend,
            targetConfirmations,
            description: `journal-${journal.journalId}`,
        });
        if (txHash instanceof onchain_1.InsufficientOnChainFundsError ||
            txHash instanceof onchain_1.CPFPAncestorLimitReachedError) {
            const reverted = await ledgerService.revertOnChainPayment({
                journalId: journal.journalId,
            });
            if (reverted instanceof Error)
                return reverted;
            return txHash;
        }
        if (txHash instanceof Error) {
            logger.error({ err: txHash, address, tokens: amountToSend, success: false }, "Impossible to sendToChainAddress");
            return txHash;
        }
        const updated = await ledgerService.setOnChainTxSendHash({
            journalId: journal.journalId,
            newTxHash: txHash,
        });
        if (updated instanceof Error)
            return updated;
        const finalMinerFee = await onChainService.lookupOnChainFee({
            txHash,
            scanDepth: _config_1.ONCHAIN_SCAN_DEPTH_OUTGOING,
        });
        if (finalMinerFee instanceof Error) {
            logger.error({ err: finalMinerFee }, "impossible to get fee for onchain payment");
            (0, tracing_1.addAttributesToCurrentSpan)({
                "payOnChainByWalletId.errorGettingMinerFee": true,
            });
        }
        (0, tracing_1.addAttributesToCurrentSpan)({
            "payOnChainByWalletId.actualMinerFee": `${finalMinerFee}`,
        });
        return lightning_1.PaymentSendStatus.Success;
    });
};
//# sourceMappingURL=send-on-chain.js.map