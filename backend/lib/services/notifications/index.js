"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const fiat_1 = require("../../domain/fiat");
const bitcoin_1 = require("../../domain/bitcoin");
const shared_1 = require("../../domain/shared");
const pubsub_1 = require("../../domain/pubsub");
const notifications_1 = require("../../domain/notifications");
const pubsub_2 = require("../pubsub");
const tracing_1 = require("../tracing");
const push_notifications_1 = require("./push-notifications");
const create_push_notification_content_1 = require("./create-push-notification-content");
const NotificationsService = () => {
    const pubsub = (0, pubsub_2.PubSubService)();
    const pushNotification = (0, push_notifications_1.PushNotificationsService)();
    const lightningTxReceived = async ({ recipientAccountId, recipientWalletId, paymentAmount, displayPaymentAmount, paymentHash, recipientDeviceTokens, recipientLanguage, }) => {
        try {
            // Notify public subscribers (via GraphQL subscription if any)
            const lnPaymentStatusTrigger = (0, pubsub_1.customPubSubTrigger)({
                event: pubsub_1.PubSubDefaultTriggers.LnPaymentStatus,
                suffix: paymentHash,
            });
            pubsub.publish({
                trigger: lnPaymentStatusTrigger,
                payload: { status: "PAID" },
            });
            // Notify the recipient (via GraphQL subscription if any)
            const accountUpdatedTrigger = (0, pubsub_1.customPubSubTrigger)({
                event: pubsub_1.PubSubDefaultTriggers.AccountUpdate,
                suffix: recipientAccountId,
            });
            pubsub.publish({
                trigger: accountUpdatedTrigger,
                payload: {
                    invoice: {
                        walletId: recipientWalletId,
                        paymentHash,
                        status: "PAID",
                    },
                },
            });
            if (recipientDeviceTokens && recipientDeviceTokens.length > 0) {
                const { title, body } = (0, create_push_notification_content_1.createPushNotificationContent)({
                    type: notifications_1.NotificationType.LnInvoicePaid,
                    userLanguage: recipientLanguage,
                    amount: paymentAmount,
                    displayAmount: displayPaymentAmount,
                });
                // Do not await this call for quicker processing
                pushNotification.sendNotification({
                    deviceToken: recipientDeviceTokens,
                    title,
                    body,
                });
            }
        }
        catch (err) {
            return new notifications_1.UnknownNotificationsServiceError(err.message || err);
        }
    };
    const intraLedgerTxReceived = async ({ recipientAccountId, recipientWalletId, paymentAmount, displayPaymentAmount, recipientDeviceTokens, recipientLanguage, }) => {
        try {
            // Notify the recipient (via GraphQL subscription if any)
            const accountUpdatedTrigger = (0, pubsub_1.customPubSubTrigger)({
                event: pubsub_1.PubSubDefaultTriggers.AccountUpdate,
                suffix: recipientAccountId,
            });
            const data = {
                walletId: recipientWalletId,
                txNotificationType: notifications_1.NotificationType.IntraLedgerReceipt,
                amount: paymentAmount.amount,
                currency: paymentAmount.currency,
                displayAmount: displayPaymentAmount?.amount,
                displayCurrency: displayPaymentAmount?.currency,
            };
            // TODO: remove deprecated fields
            if (displayPaymentAmount)
                data["displayCurrencyPerSat"] =
                    displayPaymentAmount.amount / Number(paymentAmount.amount);
            if (paymentAmount.currency === shared_1.WalletCurrency.Btc)
                data["sats"] = (0, bitcoin_1.toSats)(paymentAmount.amount);
            if (paymentAmount.currency === shared_1.WalletCurrency.Usd)
                data["cents"] = (0, fiat_1.toCents)(paymentAmount.amount);
            pubsub.publish({
                trigger: accountUpdatedTrigger,
                payload: { intraLedger: data },
            });
            if (recipientDeviceTokens && recipientDeviceTokens.length > 0) {
                const { title, body } = (0, create_push_notification_content_1.createPushNotificationContent)({
                    type: notifications_1.NotificationType.IntraLedgerReceipt,
                    userLanguage: recipientLanguage,
                    amount: paymentAmount,
                    displayAmount: displayPaymentAmount,
                });
                // Do not await this call for quicker processing
                pushNotification.sendNotification({
                    deviceToken: recipientDeviceTokens,
                    title,
                    body,
                });
            }
        }
        catch (err) {
            return new notifications_1.UnknownNotificationsServiceError(err.message || err);
        }
    };
    const sendOnChainNotification = async ({ type, accountId, walletId, paymentAmount, displayPaymentAmount, deviceTokens, language, txHash, }) => {
        try {
            // Notify the recipient (via GraphQL subscription if any)
            const accountUpdatedTrigger = (0, pubsub_1.customPubSubTrigger)({
                event: pubsub_1.PubSubDefaultTriggers.AccountUpdate,
                suffix: accountId,
            });
            const data = {
                walletId,
                txNotificationType: type,
                amount: paymentAmount.amount,
                currency: paymentAmount.currency,
                displayAmount: displayPaymentAmount?.amount,
                displayCurrency: displayPaymentAmount?.currency,
                txHash,
            };
            // TODO: remove deprecated fields
            if (displayPaymentAmount)
                data["displayCurrencyPerSat"] =
                    displayPaymentAmount.amount / Number(paymentAmount.amount);
            pubsub.publish({
                trigger: accountUpdatedTrigger,
                payload: { transaction: data },
            });
            if (deviceTokens && deviceTokens.length > 0) {
                const { title, body } = (0, create_push_notification_content_1.createPushNotificationContent)({
                    type,
                    userLanguage: language,
                    amount: paymentAmount,
                    displayAmount: displayPaymentAmount,
                });
                // Do not await this call for quicker processing
                pushNotification.sendNotification({
                    deviceToken: deviceTokens,
                    title,
                    body,
                });
            }
        }
        catch (err) {
            return new notifications_1.UnknownNotificationsServiceError(err.message || err);
        }
    };
    const onChainTxReceived = async ({ recipientAccountId, recipientWalletId, paymentAmount, displayPaymentAmount, recipientDeviceTokens, recipientLanguage, txHash, }) => sendOnChainNotification({
        type: notifications_1.NotificationType.OnchainReceipt,
        accountId: recipientAccountId,
        walletId: recipientWalletId,
        paymentAmount,
        displayPaymentAmount,
        deviceTokens: recipientDeviceTokens,
        language: recipientLanguage,
        txHash,
    });
    const onChainTxReceivedPending = async ({ recipientAccountId, recipientWalletId, paymentAmount, displayPaymentAmount, recipientDeviceTokens, recipientLanguage, txHash, }) => sendOnChainNotification({
        type: notifications_1.NotificationType.OnchainReceiptPending,
        accountId: recipientAccountId,
        walletId: recipientWalletId,
        paymentAmount,
        displayPaymentAmount,
        deviceTokens: recipientDeviceTokens,
        language: recipientLanguage,
        txHash,
    });
    const onChainTxSent = async ({ senderAccountId, senderWalletId, paymentAmount, displayPaymentAmount, senderDeviceTokens, senderLanguage, txHash, }) => sendOnChainNotification({
        type: notifications_1.NotificationType.OnchainPayment,
        accountId: senderAccountId,
        walletId: senderWalletId,
        paymentAmount,
        displayPaymentAmount,
        deviceTokens: senderDeviceTokens,
        language: senderLanguage,
        txHash,
    });
    const priceUpdate = (displayCurrencyPerSat) => {
        const payload = { satUsdCentPrice: 100 * displayCurrencyPerSat };
        pubsub.publish({ trigger: pubsub_1.PubSubDefaultTriggers.PriceUpdate, payload });
        pubsub.publish({
            trigger: pubsub_1.PubSubDefaultTriggers.UserPriceUpdate,
            payload: {
                price: payload,
            },
        });
    };
    const sendBalance = async ({ balanceAmount, recipientDeviceTokens, displayBalanceAmount, recipientLanguage, }) => {
        const hasDeviceTokens = recipientDeviceTokens && recipientDeviceTokens.length > 0;
        if (!hasDeviceTokens)
            return;
        try {
            const { title, body } = (0, create_push_notification_content_1.createPushNotificationContent)({
                type: "balance",
                userLanguage: recipientLanguage,
                amount: balanceAmount,
                displayAmount: displayBalanceAmount,
            });
            // Do not await this call for quicker processing
            pushNotification.sendNotification({
                deviceToken: recipientDeviceTokens,
                title,
                body,
            });
        }
        catch (err) {
            return new notifications_1.UnknownNotificationsServiceError(err.message || err);
        }
    };
    // trace everything except price update because it runs every 30 seconds
    return {
        priceUpdate,
        ...(0, tracing_1.wrapAsyncFunctionsToRunInSpan)({
            namespace: "services.notifications",
            fns: {
                lightningTxReceived,
                intraLedgerTxReceived,
                onChainTxReceived,
                onChainTxReceivedPending,
                onChainTxSent,
                sendBalance,
            },
        }),
    };
};
exports.NotificationsService = NotificationsService;
//# sourceMappingURL=index.js.map