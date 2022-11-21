"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePendingPaymentsByWalletId = exports.updatePendingPayments = void 0;
const bitcoin_1 = require("../../domain/bitcoin");
const lightning_1 = require("../../domain/bitcoin/lightning");
const errors_1 = require("../../domain/errors");
const ledger_1 = require("../../domain/ledger");
const payments_1 = require("../../domain/payments");
const shared_1 = require("../../domain/shared");
const ledger_2 = require("../../services/ledger");
const lnd_1 = require("../../services/lnd");
const lock_1 = require("../../services/lock");
const mongoose_1 = require("../../services/mongoose");
const tracing_1 = require("../../services/tracing");
const _app_1 = require("../index");
const _utils_1 = require("../../utils/index");
const translations_1 = require("./translations");
const updatePendingPayments = async (logger) => {
    const ledgerService = (0, ledger_2.LedgerService)();
    const walletIdsWithPendingPayments = ledgerService.listWalletIdsWithPendingPayments();
    if (walletIdsWithPendingPayments instanceof Error) {
        logger.error({ error: walletIdsWithPendingPayments }, "finish updating pending payments with error");
        return;
    }
    await (0, _utils_1.runInParallel)({
        iterator: walletIdsWithPendingPayments,
        logger,
        processor: async (walletId, index) => {
            logger.trace("updating pending payments for walletId %s in worker %d", walletId, index);
            await (0, exports.updatePendingPaymentsByWalletId)({ walletId, logger });
        },
    });
    logger.info("finish updating pending payments");
};
exports.updatePendingPayments = updatePendingPayments;
exports.updatePendingPaymentsByWalletId = (0, tracing_1.wrapAsyncToRunInSpan)({
    namespace: "app.payments",
    fnName: "updatePendingPaymentsByWalletId",
    fn: async ({ walletId, logger, }) => {
        const ledgerService = (0, ledger_2.LedgerService)();
        const count = await ledgerService.getPendingPaymentsCount(walletId);
        if (count instanceof Error)
            return count;
        (0, tracing_1.addAttributesToCurrentSpan)({ pendingPaymentsCount: count });
        if (count === 0)
            return;
        const pendingPayments = await ledgerService.listPendingPayments(walletId);
        if (pendingPayments instanceof Error)
            return pendingPayments;
        for (const pendingPayment of pendingPayments) {
            await updatePendingPayment({
                walletId,
                pendingPayment,
                logger,
            });
        }
    },
});
const updatePendingPayment = (0, tracing_1.wrapAsyncToRunInSpan)({
    namespace: "app.payments",
    fnName: "updatePendingPayment",
    fn: async ({ walletId, pendingPayment, logger, }) => {
        const { paymentHash, pubkey, type: txType } = pendingPayment;
        (0, tracing_1.addAttributesToCurrentSpan)({ walletId, paymentHash, txType });
        const paymentLogger = logger.child({
            topic: "payment",
            protocol: "lightning",
            transactionType: "payment",
            onUs: false,
            payment: pendingPayment,
        });
        const lndService = (0, lnd_1.LndService)();
        if (lndService instanceof Error)
            return lndService;
        // If we had PaymentLedgerType => no need for checking the fields
        if (!paymentHash)
            throw new errors_1.InconsistentDataError("paymentHash missing from payment transaction");
        if (!pubkey)
            throw new errors_1.InconsistentDataError("pubkey missing from payment transaction");
        const lnPaymentLookup = await lndService.lookupPayment({
            pubkey,
            paymentHash,
        });
        if (lnPaymentLookup instanceof Error) {
            logger.error({
                err: lnPaymentLookup,
                topic: "payment",
                protocol: "lightning",
                transactionType: "payment",
                onUs: false,
            }, "issue fetching payment");
            return lnPaymentLookup;
        }
        let roundedUpFee;
        const { status } = lnPaymentLookup;
        if (status != lightning_1.PaymentStatus.Failed) {
            roundedUpFee = lnPaymentLookup.confirmedDetails?.roundedUpFee || (0, bitcoin_1.toSats)(0);
        }
        if (status === lightning_1.PaymentStatus.Settled || status === lightning_1.PaymentStatus.Failed) {
            return (0, lock_1.LockService)().lockPaymentHash(paymentHash, async () => {
                const ledgerService = (0, ledger_2.LedgerService)();
                const recorded = await ledgerService.isLnTxRecorded(paymentHash);
                if (recorded instanceof Error) {
                    paymentLogger.error({ error: recorded }, "we couldn't query pending transaction");
                    return recorded;
                }
                if (recorded) {
                    paymentLogger.info("payment has already been processed");
                    return true;
                }
                const inputAmount = (0, ledger_1.inputAmountFromLedgerTransaction)(pendingPayment);
                if (inputAmount instanceof Error)
                    return inputAmount;
                const paymentFlowIndex = {
                    paymentHash,
                    walletId,
                    inputAmount,
                };
                let paymentFlow = await (0, mongoose_1.PaymentFlowStateRepository)(lightning_1.defaultTimeToExpiryInSeconds).markLightningPaymentFlowNotPending(paymentFlowIndex);
                if (paymentFlow instanceof Error) {
                    paymentFlow = await reconstructPendingPaymentFlow(paymentHash);
                    if (paymentFlow instanceof Error)
                        return paymentFlow;
                }
                const settled = await ledgerService.settlePendingLnPayment(paymentHash);
                if (settled instanceof Error) {
                    paymentLogger.error({ error: settled }, "no transaction to update");
                    return settled;
                }
                if (status === lightning_1.PaymentStatus.Settled) {
                    paymentLogger.info({ success: true, id: paymentHash, payment: pendingPayment }, "payment has been confirmed");
                    const revealedPreImage = lnPaymentLookup.confirmedDetails?.revealedPreImage;
                    if (revealedPreImage)
                        (0, ledger_2.LedgerService)().updateMetadataByHash({
                            hash: paymentHash,
                            revealedPreImage,
                        });
                    if (pendingPayment.feeKnownInAdvance)
                        return true;
                    const { displayAmount, displayFee } = pendingPayment;
                    if (displayAmount === undefined || displayFee === undefined)
                        return new ledger_1.UnknownLedgerError("missing display-related values in transaction");
                    return _app_1.Wallets.reimburseFee({
                        paymentFlow,
                        journalId: pendingPayment.journalId,
                        actualFee: roundedUpFee,
                        revealedPreImage,
                    });
                }
                else if (status === lightning_1.PaymentStatus.Failed) {
                    paymentLogger.warn({ success: false, id: paymentHash, payment: pendingPayment }, "payment has failed. reverting transaction");
                    if (paymentFlow.senderWalletCurrency === shared_1.WalletCurrency.Btc) {
                        const voided = await ledgerService.revertLightningPayment({
                            journalId: pendingPayment.journalId,
                            paymentHash,
                        });
                        if (voided instanceof Error) {
                            const error = `error voiding payment entry`;
                            logger.fatal({ success: false, result: lnPaymentLookup }, error);
                            return (0, shared_1.setErrorCritical)(voided);
                        }
                    }
                    else {
                        const reimbursed = await _app_1.Wallets.reimburseFailedUsdPayment({
                            journalId: pendingPayment.journalId,
                            paymentFlow,
                        });
                        if (reimbursed instanceof Error) {
                            const error = `error reimbursing usd payment entry`;
                            logger.fatal({ success: false, result: lnPaymentLookup }, error);
                            return (0, shared_1.setErrorCritical)(reimbursed);
                        }
                    }
                }
                return true;
            });
        }
        return true;
    },
});
const reconstructPendingPaymentFlow = async (paymentHash) => {
    const ledgerTxns = await (0, ledger_2.LedgerService)().getTransactionsByHash(paymentHash);
    if (ledgerTxns instanceof Error)
        return ledgerTxns;
    const nonEndUserWalletIds = Object.values(await (0, ledger_2.getNonEndUserWalletIds)());
    const payment = ledgerTxns.find((tx) => tx.pendingConfirmation === true &&
        tx.type === ledger_1.LedgerTransactionType.Payment &&
        tx.debit > 0 &&
        tx.walletId !== undefined &&
        !nonEndUserWalletIds.includes(tx.walletId));
    if (!payment)
        return new ledger_1.CouldNotFindTransactionError();
    const { walletId: senderWalletId } = payment;
    if (!senderWalletId)
        return new payments_1.MissingPropsInTransactionForPaymentFlowError();
    const senderWallet = await (0, mongoose_1.WalletsRepository)().findById(senderWalletId);
    if (senderWallet instanceof Error)
        return senderWallet;
    const senderAccount = await (0, mongoose_1.AccountsRepository)().findById(senderWallet.accountId);
    if (senderAccount instanceof Error)
        return senderAccount;
    return (0, translations_1.PaymentFlowFromLedgerTransaction)({
        ledgerTxn: payment,
        senderAccountId: senderAccount.id,
    });
};
//# sourceMappingURL=update-pending-payments.js.map