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
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineHeldInvoice = exports.updatePendingInvoiceByPaymentHash = exports.handleHeldInvoices = void 0;
const shared_1 = require("../shared");
const bitcoin_1 = require("../../domain/bitcoin");
const lightning_1 = require("../../domain/bitcoin/lightning");
const errors_1 = require("../../domain/errors");
const wallet_invoice_receiver_1 = require("../../domain/wallet-invoices/wallet-invoice-receiver");
const shared_2 = require("../../domain/shared");
const lock_1 = require("../../services/lock");
const dealer_price_1 = require("../../services/dealer-price");
const lnd_1 = require("../../services/lnd");
const mongoose_1 = require("../../services/mongoose");
const notifications_1 = require("../../services/notifications");
const LedgerFacade = __importStar(require("../../services/ledger/facade"));
const tracing_1 = require("../../services/tracing");
const _utils_1 = require("../../utils/index");
const handleHeldInvoices = async (logger) => {
    const invoicesRepo = (0, mongoose_1.WalletInvoicesRepository)();
    const pendingInvoices = invoicesRepo.yieldPending();
    if (pendingInvoices instanceof Error) {
        logger.error({ error: pendingInvoices }, "finish updating pending invoices with error");
        return;
    }
    await (0, _utils_1.runInParallel)({
        iterator: pendingInvoices,
        logger,
        processor: async (walletInvoice, index) => {
            logger.trace("updating pending invoices %s in worker %d", index);
            walletInvoice.recipientWalletDescriptor.currency === shared_2.WalletCurrency.Btc
                ? await updatePendingInvoice({ walletInvoice, logger })
                : await (0, exports.declineHeldInvoice)({
                    pubkey: walletInvoice.pubkey,
                    paymentHash: walletInvoice.paymentHash,
                    logger,
                });
        },
    });
    logger.info("finish updating pending invoices");
};
exports.handleHeldInvoices = handleHeldInvoices;
const updatePendingInvoiceByPaymentHash = async ({ paymentHash, logger, }) => {
    const invoicesRepo = (0, mongoose_1.WalletInvoicesRepository)();
    const walletInvoice = await invoicesRepo.findByPaymentHash(paymentHash);
    if (walletInvoice instanceof errors_1.CouldNotFindError) {
        logger.info({ paymentHash }, "WalletInvoice doesn't exist");
        return false;
    }
    if (walletInvoice instanceof Error)
        return walletInvoice;
    return updatePendingInvoice({ walletInvoice, logger });
};
exports.updatePendingInvoiceByPaymentHash = updatePendingInvoiceByPaymentHash;
const dealer = (0, dealer_price_1.NewDealerPriceService)();
const updatePendingInvoiceBeforeFinally = async ({ walletInvoice, logger, }) => {
    (0, tracing_1.addAttributesToCurrentSpan)({
        paymentHash: walletInvoice.paymentHash,
        pubkey: walletInvoice.pubkey,
    });
    const lndService = (0, lnd_1.LndService)();
    if (lndService instanceof Error)
        return lndService;
    const walletInvoicesRepo = (0, mongoose_1.WalletInvoicesRepository)();
    const { pubkey, paymentHash, secret, recipientWalletDescriptor } = walletInvoice;
    const pendingInvoiceLogger = logger.child({
        hash: paymentHash,
        walletId: recipientWalletDescriptor.id,
        topic: "payment",
        protocol: "lightning",
        transactionType: "receipt",
        onUs: false,
    });
    const lnInvoiceLookup = await lndService.lookupInvoice({ pubkey, paymentHash });
    if (lnInvoiceLookup instanceof lightning_1.InvoiceNotFoundError) {
        const isDeleted = await walletInvoicesRepo.deleteByPaymentHash(paymentHash);
        if (isDeleted instanceof Error) {
            pendingInvoiceLogger.error("impossible to delete WalletInvoice entry");
            return isDeleted;
        }
        return false;
    }
    if (lnInvoiceLookup instanceof Error)
        return lnInvoiceLookup;
    const { lnInvoice: { description }, roundedDownReceived: uncheckedRoundedDownReceived, } = lnInvoiceLookup;
    // TODO: validate roundedDownReceived as user input
    const roundedDownReceived = (0, bitcoin_1.checkedToSats)(uncheckedRoundedDownReceived);
    if (roundedDownReceived instanceof Error) {
        (0, tracing_1.recordExceptionInCurrentSpan)({
            error: roundedDownReceived,
            level: roundedDownReceived.level,
        });
        return (0, exports.declineHeldInvoice)({
            pubkey: walletInvoice.pubkey,
            paymentHash: walletInvoice.paymentHash,
            logger,
        });
    }
    if (walletInvoice.paid) {
        pendingInvoiceLogger.info("invoice has already been processed");
        return true;
    }
    if (!lnInvoiceLookup.isHeld && !lnInvoiceLookup.isSettled) {
        pendingInvoiceLogger.info("invoice has not been paid yet");
        return false;
    }
    const receivedBtc = (0, shared_2.paymentAmountFromNumber)({
        amount: roundedDownReceived,
        currency: shared_2.WalletCurrency.Btc,
    });
    if (receivedBtc instanceof Error)
        return receivedBtc;
    const lockService = (0, lock_1.LockService)();
    return lockService.lockPaymentHash(paymentHash, async () => {
        // we're getting the invoice another time, now behind the lock, to avoid potential race condition
        const invoiceToUpdate = await walletInvoicesRepo.findByPaymentHash(paymentHash);
        if (invoiceToUpdate instanceof errors_1.CouldNotFindError) {
            pendingInvoiceLogger.error({ paymentHash }, "WalletInvoice doesn't exist");
            return false;
        }
        if (invoiceToUpdate instanceof Error)
            return invoiceToUpdate;
        if (walletInvoice.paid) {
            pendingInvoiceLogger.info("invoice has already been processed");
            return true;
        }
        // Prepare metadata and record transaction
        const walletInvoiceReceiver = await (0, wallet_invoice_receiver_1.WalletInvoiceReceiver)({
            walletInvoice,
            receivedBtc,
            usdFromBtc: dealer.getCentsFromSatsForImmediateBuy,
            usdFromBtcMidPrice: shared_1.usdFromBtcMidPriceFn,
        });
        if (walletInvoiceReceiver instanceof Error)
            return walletInvoiceReceiver;
        if (!lnInvoiceLookup.isSettled) {
            const invoiceSettled = await lndService.settleInvoice({ pubkey, secret });
            if (invoiceSettled instanceof Error)
                return invoiceSettled;
        }
        const invoicePaid = await walletInvoicesRepo.markAsPaid(paymentHash);
        if (invoicePaid instanceof Error)
            return invoicePaid;
        // TODO: this should be a in a mongodb transaction session with the ledger transaction below
        // markAsPaid could be done after the transaction, but we should in that case not only look
        // for walletInvoicesRepo, but also in the ledger to make sure in case the process crash in this
        // loop that an eventual consistency doesn't lead to a double credit
        const metadata = LedgerFacade.LnReceiveLedgerMetadata({
            paymentHash,
            fee: walletInvoiceReceiver.btcBankFee,
            feeDisplayCurrency: Number(walletInvoiceReceiver.usdBankFee.amount),
            amountDisplayCurrency: Number(walletInvoiceReceiver.usdToCreditReceiver.amount),
            pubkey: walletInvoiceReceiver.pubkey,
        });
        const recipientWallet = await (0, mongoose_1.WalletsRepository)().findById(recipientWalletDescriptor.id);
        if (recipientWallet instanceof Error)
            return recipientWallet;
        const recipientAccount = await (0, mongoose_1.AccountsRepository)().findById(recipientWallet.accountId);
        if (recipientAccount instanceof Error)
            return recipientAccount;
        //TODO: add displayCurrency: displayPaymentAmount.currency,
        const result = await LedgerFacade.recordReceive({
            description,
            recipientWalletDescriptor: {
                ...walletInvoiceReceiver.recipientWalletDescriptor,
                accountId: recipientAccount.id,
            },
            amountToCreditReceiver: {
                usd: walletInvoiceReceiver.usdToCreditReceiver,
                btc: walletInvoiceReceiver.btcToCreditReceiver,
            },
            bankFee: {
                usd: walletInvoiceReceiver.usdBankFee,
                btc: walletInvoiceReceiver.btcBankFee,
            },
            metadata,
            txMetadata: {
                hash: metadata.hash,
            },
        });
        if (result instanceof Error)
            return result;
        // Prepare and send notification
        const { usdToCreditReceiver: displayAmount } = walletInvoiceReceiver;
        const displayPaymentAmount = {
            amount: Number((Number(displayAmount.amount) / 100).toFixed(2)),
            currency: displayAmount.currency,
        };
        const recipientUser = await (0, mongoose_1.UsersRepository)().findById(recipientAccount.ownerId);
        if (recipientUser instanceof Error)
            return recipientUser;
        const notificationsService = (0, notifications_1.NotificationsService)();
        notificationsService.lightningTxReceived({
            recipientAccountId: recipientWallet.accountId,
            recipientWalletId: recipientWallet.id,
            paymentAmount: walletInvoiceReceiver.receivedAmount(),
            displayPaymentAmount,
            paymentHash,
            recipientDeviceTokens: recipientUser.deviceTokens,
            recipientLanguage: recipientUser.language,
        });
        return true;
    });
};
const updatePendingInvoice = (0, tracing_1.wrapAsyncToRunInSpan)({
    namespace: "app.invoices",
    fnName: "updatePendingInvoice",
    fn: async ({ walletInvoice, logger, }) => {
        const result = await updatePendingInvoiceBeforeFinally({
            walletInvoice,
            logger,
        });
        if (result) {
            if (!walletInvoice.paid) {
                const walletInvoices = (0, mongoose_1.WalletInvoicesRepository)();
                const invoicePaid = await walletInvoices.markAsPaid(walletInvoice.paymentHash);
                if (invoicePaid instanceof Error &&
                    !(invoicePaid instanceof errors_1.CouldNotFindWalletInvoiceError)) {
                    return invoicePaid;
                }
            }
        }
        return result;
    },
});
exports.declineHeldInvoice = (0, tracing_1.wrapAsyncToRunInSpan)({
    namespace: "app.invoices",
    fnName: "declineHeldInvoice",
    fn: async ({ pubkey, paymentHash, logger, }) => {
        (0, tracing_1.addAttributesToCurrentSpan)({ paymentHash, pubkey });
        const lndService = (0, lnd_1.LndService)();
        if (lndService instanceof Error)
            return lndService;
        const walletInvoicesRepo = (0, mongoose_1.WalletInvoicesRepository)();
        const lnInvoiceLookup = await lndService.lookupInvoice({ pubkey, paymentHash });
        const pendingInvoiceLogger = logger.child({
            hash: paymentHash,
            pubkey,
            lnInvoiceLookup,
            topic: "payment",
            protocol: "lightning",
            transactionType: "receipt",
            onUs: false,
        });
        if (lnInvoiceLookup instanceof lightning_1.InvoiceNotFoundError) {
            const isDeleted = await walletInvoicesRepo.deleteByPaymentHash(paymentHash);
            if (isDeleted instanceof Error) {
                pendingInvoiceLogger.error("impossible to delete WalletInvoice entry");
                return isDeleted;
            }
            return false;
        }
        if (lnInvoiceLookup instanceof Error)
            return lnInvoiceLookup;
        if (lnInvoiceLookup.isSettled) {
            return new errors_1.InvalidNonHodlInvoiceError(JSON.stringify({ paymentHash: lnInvoiceLookup.paymentHash }));
        }
        if (!lnInvoiceLookup.isHeld) {
            pendingInvoiceLogger.info({ lnInvoiceLookup }, "invoice has not been paid yet");
            return false;
        }
        let heldForMsg = "";
        if (lnInvoiceLookup.heldAt) {
            heldForMsg = `for ${(0, _utils_1.elapsedSinceTimestamp)(lnInvoiceLookup.heldAt)}s `;
        }
        pendingInvoiceLogger.error({ lnInvoiceLookup }, `invoice has been held ${heldForMsg}and is now been cancelled`);
        const invoiceSettled = await lndService.cancelInvoice({ pubkey, paymentHash });
        if (invoiceSettled instanceof Error)
            return invoiceSettled;
        const isDeleted = await walletInvoicesRepo.deleteByPaymentHash(paymentHash);
        if (isDeleted instanceof Error) {
            pendingInvoiceLogger.error("impossible to delete WalletInvoice entry");
        }
        return true;
    },
});
//# sourceMappingURL=update-pending-invoices.js.map