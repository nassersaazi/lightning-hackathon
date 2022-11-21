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
exports.payNoAmountInvoiceByWalletId = exports.payInvoiceByWalletId = void 0;
const shared_1 = require("../../domain/shared");
const payments_1 = require("../../domain/payments");
const accounts_1 = require("../../domain/accounts");
const wallets_1 = require("../../domain/wallets");
const lightning_1 = require("../../domain/bitcoin/lightning");
const fiat_1 = require("../../domain/fiat");
const errors_1 = require("../../domain/errors");
const lnd_1 = require("../../services/lnd");
const mongoose_1 = require("../../services/mongoose");
const lock_1 = require("../../services/lock");
const ledger_1 = require("../../services/ledger");
const notifications_1 = require("../../services/notifications");
const dealer_price_1 = require("../../services/dealer-price");
const LedgerFacade = __importStar(require("../../services/ledger/facade"));
const tracing_1 = require("../../services/tracing");
const _app_1 = require("../index");
const lock_2 = require("../../domain/lock");
const helpers_1 = require("./helpers");
const dealer = (0, dealer_price_1.NewDealerPriceService)();
const paymentFlowRepo = (0, mongoose_1.PaymentFlowStateRepository)(lightning_1.defaultTimeToExpiryInSeconds);
const payInvoiceByWalletId = async ({ uncheckedPaymentRequest, memo, senderWalletId: uncheckedSenderWalletId, senderAccount, }) => {
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.initiation_method": wallets_1.PaymentInitiationMethod.Lightning,
    });
    const validatedPaymentInputs = await validateInvoicePaymentInputs({
        uncheckedPaymentRequest,
        uncheckedSenderWalletId,
        senderAccount,
    });
    if (validatedPaymentInputs instanceof errors_1.AlreadyPaidError) {
        return lightning_1.PaymentSendStatus.AlreadyPaid;
    }
    if (validatedPaymentInputs instanceof Error) {
        return validatedPaymentInputs;
    }
    const paymentFlow = await getPaymentFlow(validatedPaymentInputs);
    if (paymentFlow instanceof Error)
        return paymentFlow;
    // Get display currency price... add to payment flow builder?
    const { senderWallet, decodedInvoice } = validatedPaymentInputs;
    return paymentFlow.settlementMethod === wallets_1.SettlementMethod.IntraLedger
        ? executePaymentViaIntraledger({
            paymentFlow,
            senderWallet,
            senderUsername: senderAccount.username,
            memo,
        })
        : executePaymentViaLn({ decodedInvoice, paymentFlow, senderWallet });
};
exports.payInvoiceByWalletId = payInvoiceByWalletId;
const payNoAmountInvoiceByWalletId = async ({ uncheckedPaymentRequest, amount, memo, senderWalletId: uncheckedSenderWalletId, senderAccount, }) => {
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.initiation_method": wallets_1.PaymentInitiationMethod.Lightning,
    });
    const validatedNoAmountPaymentInputs = await validateNoAmountInvoicePaymentInputs({
        uncheckedPaymentRequest,
        amount,
        uncheckedSenderWalletId,
        senderAccount,
    });
    if (validatedNoAmountPaymentInputs instanceof errors_1.AlreadyPaidError) {
        return lightning_1.PaymentSendStatus.AlreadyPaid;
    }
    if (validatedNoAmountPaymentInputs instanceof Error) {
        return validatedNoAmountPaymentInputs;
    }
    const paymentFlow = await getPaymentFlow(validatedNoAmountPaymentInputs);
    if (paymentFlow instanceof Error)
        return paymentFlow;
    // Get display currency price... add to payment flow builder?
    const { senderWallet, decodedInvoice } = validatedNoAmountPaymentInputs;
    return paymentFlow.settlementMethod === wallets_1.SettlementMethod.IntraLedger
        ? executePaymentViaIntraledger({
            paymentFlow,
            senderWallet,
            senderUsername: senderAccount.username,
            memo,
        })
        : executePaymentViaLn({ decodedInvoice, paymentFlow, senderWallet });
};
exports.payNoAmountInvoiceByWalletId = payNoAmountInvoiceByWalletId;
const validateInvoicePaymentInputs = async ({ uncheckedPaymentRequest, uncheckedSenderWalletId, senderAccount, }) => {
    const senderWalletId = (0, wallets_1.checkedToWalletId)(uncheckedSenderWalletId);
    if (senderWalletId instanceof Error)
        return senderWalletId;
    const decodedInvoice = (0, lightning_1.decodeInvoice)(uncheckedPaymentRequest);
    if (decodedInvoice instanceof Error)
        return decodedInvoice;
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.request.destination": decodedInvoice.destination,
        "payment.request.hash": decodedInvoice.paymentHash,
        "payment.request.description": decodedInvoice.description,
        "payment.request.expiresAt": decodedInvoice.expiresAt
            ? decodedInvoice.expiresAt.toISOString()
            : "undefined",
    });
    const { paymentAmount: lnInvoiceAmount } = decodedInvoice;
    if (!(lnInvoiceAmount && lnInvoiceAmount.amount > 0n)) {
        return new payments_1.LnPaymentRequestNonZeroAmountRequiredError();
    }
    const senderWallet = await (0, mongoose_1.WalletsRepository)().findById(senderWalletId);
    if (senderWallet instanceof Error)
        return senderWallet;
    const accountValidator = (0, accounts_1.AccountValidator)(senderAccount);
    if (accountValidator instanceof Error)
        return accountValidator;
    const validateWallet = accountValidator.validateWalletForAccount(senderWallet);
    if (validateWallet instanceof Error)
        return validateWallet;
    return {
        senderWallet,
        decodedInvoice,
        inputPaymentAmount: lnInvoiceAmount,
    };
};
const validateNoAmountInvoicePaymentInputs = async ({ uncheckedPaymentRequest, amount, uncheckedSenderWalletId, senderAccount, }) => {
    const senderWalletId = (0, wallets_1.checkedToWalletId)(uncheckedSenderWalletId);
    if (senderWalletId instanceof Error)
        return senderWalletId;
    const decodedInvoice = (0, lightning_1.decodeInvoice)(uncheckedPaymentRequest);
    if (decodedInvoice instanceof Error)
        return decodedInvoice;
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.request.destination": decodedInvoice.destination,
        "payment.request.hash": decodedInvoice.paymentHash,
        "payment.request.description": decodedInvoice.description,
        "payment.request.expiresAt": decodedInvoice.expiresAt
            ? decodedInvoice.expiresAt.toISOString()
            : "undefined",
    });
    const { paymentAmount: lnInvoiceAmount } = decodedInvoice;
    if (lnInvoiceAmount && lnInvoiceAmount.amount > 0n) {
        return new payments_1.LnPaymentRequestZeroAmountRequiredError();
    }
    const senderWallet = await (0, mongoose_1.WalletsRepository)().findById(senderWalletId);
    if (senderWallet instanceof Error)
        return senderWallet;
    const accountValidator = (0, accounts_1.AccountValidator)(senderAccount);
    if (accountValidator instanceof Error)
        return accountValidator;
    const validateWallet = accountValidator.validateWalletForAccount(senderWallet);
    if (validateWallet instanceof Error)
        return validateWallet;
    const inputPaymentAmount = senderWallet.currency === shared_1.WalletCurrency.Btc
        ? (0, payments_1.checkedToBtcPaymentAmount)(amount)
        : (0, payments_1.checkedToUsdPaymentAmount)(amount);
    if (inputPaymentAmount instanceof Error)
        return inputPaymentAmount;
    return {
        senderWallet,
        decodedInvoice,
        inputPaymentAmount: inputPaymentAmount,
        uncheckedAmount: amount,
    };
};
const getPaymentFlow = async ({ senderWallet, decodedInvoice, inputPaymentAmount, uncheckedAmount, }) => {
    let paymentFlow = await paymentFlowRepo.findLightningPaymentFlow({
        walletId: senderWallet.id,
        paymentHash: decodedInvoice.paymentHash,
        inputAmount: inputPaymentAmount.amount,
    });
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.paymentFlow.existsFromProbe": `${!(paymentFlow instanceof errors_1.CouldNotFindLightningPaymentFlowError)}`,
    });
    if (paymentFlow instanceof errors_1.CouldNotFindLightningPaymentFlowError) {
        const builderWithConversion = await (0, helpers_1.constructPaymentFlowBuilder)({
            uncheckedAmount,
            senderWallet,
            invoice: decodedInvoice,
            hedgeBuyUsd: {
                usdFromBtc: dealer.getCentsFromSatsForImmediateBuy,
                btcFromUsd: dealer.getSatsFromCentsForImmediateBuy,
            },
            hedgeSellUsd: {
                usdFromBtc: dealer.getCentsFromSatsForImmediateSell,
                btcFromUsd: dealer.getSatsFromCentsForImmediateSell,
            },
        });
        if (builderWithConversion instanceof Error)
            return builderWithConversion;
        paymentFlow = await builderWithConversion.withoutRoute();
        if (paymentFlow instanceof Error)
            return paymentFlow;
        const persistedPayment = await paymentFlowRepo.persistNew(paymentFlow);
        if (persistedPayment instanceof Error)
            return persistedPayment;
    }
    if (paymentFlow instanceof Error)
        return paymentFlow;
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.amount": paymentFlow.btcPaymentAmount.amount.toString(),
    });
    return paymentFlow;
};
const executePaymentViaIntraledger = async ({ paymentFlow, senderWallet, senderUsername, memo, }) => {
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.settlement_method": wallets_1.SettlementMethod.IntraLedger,
    });
    const priceRatioForLimits = await (0, helpers_1.getPriceRatioForLimits)(paymentFlow);
    if (priceRatioForLimits instanceof Error)
        return priceRatioForLimits;
    const paymentHash = paymentFlow.paymentHashForFlow();
    if (paymentHash instanceof Error)
        return paymentHash;
    const { recipientWalletId, recipientPubkey, recipientWalletCurrency, recipientUsername, } = paymentFlow.recipientDetails();
    if (!(recipientWalletId && recipientWalletCurrency && recipientPubkey)) {
        return new payments_1.InvalidLightningPaymentFlowBuilderStateError("Expected recipient details missing");
    }
    const recipientWallet = await (0, mongoose_1.WalletsRepository)().findById(recipientWalletId);
    if (recipientWallet instanceof Error)
        return recipientWallet;
    const checkLimits = senderWallet.accountId === recipientWallet.accountId
        ? helpers_1.newCheckTradeIntraAccountLimits
        : helpers_1.newCheckIntraledgerLimits;
    const limitCheck = await checkLimits({
        amount: paymentFlow.usdPaymentAmount,
        wallet: senderWallet,
        priceRatio: priceRatioForLimits,
    });
    if (limitCheck instanceof Error)
        return limitCheck;
    return (0, lock_1.LockService)().lockWalletId(senderWallet.id, async (signal) => {
        const ledgerService = (0, ledger_1.LedgerService)();
        const recorded = await ledgerService.isLnTxRecorded(paymentHash);
        if (recorded instanceof Error)
            return recorded;
        if (recorded)
            return lightning_1.PaymentSendStatus.AlreadyPaid;
        const balance = await ledgerService.getWalletBalanceAmount(senderWallet);
        if (balance instanceof Error)
            return balance;
        const balanceCheck = paymentFlow.checkBalanceForSend(balance);
        if (balanceCheck instanceof Error)
            return balanceCheck;
        const priceRatio = (0, payments_1.PriceRatio)({
            usd: paymentFlow.usdPaymentAmount,
            btc: paymentFlow.btcPaymentAmount,
        });
        if (priceRatio instanceof Error)
            return priceRatio;
        const displayCentsPerSat = priceRatio.usdPerSat();
        const converter = (0, fiat_1.NewDisplayCurrencyConverter)(displayCentsPerSat);
        if (signal.aborted) {
            return new lock_2.ResourceExpiredLockServiceError(signal.error?.message);
        }
        let metadata;
        let additionalDebitMetadata = {};
        if (senderWallet.accountId === recipientWallet.accountId) {
            ;
            ({ metadata, debitAccountAdditionalMetadata: additionalDebitMetadata } =
                LedgerFacade.LnTradeIntraAccountLedgerMetadata({
                    paymentHash,
                    pubkey: recipientPubkey,
                    paymentFlow,
                    amountDisplayCurrency: converter.fromUsdAmount(paymentFlow.usdPaymentAmount),
                    feeDisplayCurrency: 0,
                    displayCurrency: fiat_1.DisplayCurrency.Usd,
                    memoOfPayer: memo || undefined,
                }));
        }
        else {
            ;
            ({ metadata, debitAccountAdditionalMetadata: additionalDebitMetadata } =
                LedgerFacade.LnIntraledgerLedgerMetadata({
                    paymentHash,
                    pubkey: recipientPubkey,
                    paymentFlow,
                    amountDisplayCurrency: converter.fromUsdAmount(paymentFlow.usdPaymentAmount),
                    feeDisplayCurrency: 0,
                    displayCurrency: fiat_1.DisplayCurrency.Usd,
                    memoOfPayer: memo || undefined,
                    senderUsername,
                    recipientUsername,
                }));
        }
        const recipientWalletDescriptor = paymentFlow.recipientWalletDescriptor();
        if (recipientWalletDescriptor === undefined)
            return new payments_1.InvalidLightningPaymentFlowBuilderStateError();
        const journal = await LedgerFacade.recordIntraledger({
            description: paymentFlow.descriptionFromInvoice,
            amount: {
                btc: paymentFlow.btcPaymentAmount,
                usd: paymentFlow.usdPaymentAmount,
            },
            senderWalletDescriptor: paymentFlow.senderWalletDescriptor(),
            recipientWalletDescriptor,
            metadata,
            additionalDebitMetadata,
        });
        if (journal instanceof Error)
            return journal;
        const lndService = (0, lnd_1.LndService)();
        if (lndService instanceof Error)
            return lndService;
        const deletedLnInvoice = await lndService.cancelInvoice({
            pubkey: recipientPubkey,
            paymentHash,
        });
        if (deletedLnInvoice instanceof Error)
            return deletedLnInvoice;
        const newWalletInvoice = await (0, mongoose_1.WalletInvoicesRepository)().markAsPaid(paymentHash);
        if (newWalletInvoice instanceof Error)
            return newWalletInvoice;
        const recipientAccount = await (0, mongoose_1.AccountsRepository)().findById(recipientWallet.accountId);
        if (recipientAccount instanceof Error)
            return recipientAccount;
        const recipientUser = await (0, mongoose_1.UsersRepository)().findById(recipientAccount.ownerId);
        if (recipientUser instanceof Error)
            return recipientUser;
        let amount = paymentFlow.btcPaymentAmount.amount;
        if (recipientWalletCurrency === shared_1.WalletCurrency.Usd) {
            amount = paymentFlow.usdPaymentAmount.amount;
        }
        const notificationsService = (0, notifications_1.NotificationsService)();
        notificationsService.lightningTxReceived({
            recipientAccountId: recipientWallet.accountId,
            recipientWalletId,
            paymentAmount: { amount, currency: recipientWalletCurrency },
            displayPaymentAmount: { amount: metadata.usd, currency: fiat_1.DisplayCurrency.Usd },
            paymentHash,
            recipientDeviceTokens: recipientUser.deviceTokens,
            recipientLanguage: recipientUser.language,
        });
        return lightning_1.PaymentSendStatus.Success;
    });
};
const executePaymentViaLn = async ({ decodedInvoice, paymentFlow, senderWallet, }) => {
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.settlement_method": wallets_1.SettlementMethod.Lightning,
    });
    const priceRatioForLimits = await (0, helpers_1.getPriceRatioForLimits)(paymentFlow);
    if (priceRatioForLimits instanceof Error)
        return priceRatioForLimits;
    const limitCheck = await (0, helpers_1.newCheckWithdrawalLimits)({
        amount: paymentFlow.usdPaymentAmount,
        wallet: senderWallet,
        priceRatio: priceRatioForLimits,
    });
    if (limitCheck instanceof Error)
        return limitCheck;
    const { paymentHash } = decodedInvoice;
    const { rawRoute, outgoingNodePubkey } = paymentFlow.routeDetails();
    return (0, lock_1.LockService)().lockWalletId(senderWallet.id, async (signal) => {
        const ledgerService = (0, ledger_1.LedgerService)();
        const ledgerTransactions = await ledgerService.getTransactionsByHash(paymentHash);
        if (ledgerTransactions instanceof Error)
            return ledgerTransactions;
        const pendingPayment = ledgerTransactions.find((tx) => tx.pendingConfirmation);
        if (pendingPayment)
            return new payments_1.LnPaymentRequestInTransitError();
        const balance = await ledgerService.getWalletBalanceAmount(senderWallet);
        if (balance instanceof Error)
            return balance;
        const balanceCheck = paymentFlow.checkBalanceForSend(balance);
        if (balanceCheck instanceof Error)
            return balanceCheck;
        const lndService = (0, lnd_1.LndService)();
        if (lndService instanceof Error)
            return lndService;
        const priceRatio = (0, payments_1.PriceRatio)({
            usd: paymentFlow.usdPaymentAmount,
            btc: paymentFlow.btcPaymentAmount,
        });
        if (priceRatio instanceof Error)
            return priceRatio;
        const displayCentsPerSat = priceRatio.usdPerSat();
        const converter = (0, fiat_1.NewDisplayCurrencyConverter)(displayCentsPerSat);
        if (signal.aborted) {
            return new lock_2.ResourceExpiredLockServiceError(signal.error?.message);
        }
        const metadata = LedgerFacade.LnSendLedgerMetadata({
            amountDisplayCurrency: converter.fromUsdAmount(paymentFlow.usdPaymentAmount),
            feeDisplayCurrency: converter.fromUsdAmount(paymentFlow.usdProtocolFee),
            displayCurrency: fiat_1.DisplayCurrency.Usd,
            paymentFlow,
            pubkey: outgoingNodePubkey || lndService.defaultPubkey(),
            paymentHash,
            feeKnownInAdvance: !!rawRoute,
        });
        const journal = await LedgerFacade.recordSend({
            description: paymentFlow.descriptionFromInvoice,
            amountToDebitSender: {
                btc: {
                    currency: paymentFlow.btcPaymentAmount.currency,
                    amount: paymentFlow.btcPaymentAmount.amount + paymentFlow.btcProtocolFee.amount,
                },
                usd: {
                    currency: paymentFlow.usdPaymentAmount.currency,
                    amount: paymentFlow.usdPaymentAmount.amount + paymentFlow.usdProtocolFee.amount,
                },
            },
            senderWalletDescriptor: paymentFlow.senderWalletDescriptor(),
            metadata,
        });
        if (journal instanceof Error)
            return journal;
        const { journalId } = journal;
        const payResult = rawRoute
            ? await lndService.payInvoiceViaRoutes({
                paymentHash,
                rawRoute,
                pubkey: outgoingNodePubkey,
            })
            : await lndService.payInvoiceViaPaymentDetails({
                decodedInvoice,
                btcPaymentAmount: paymentFlow.btcPaymentAmount,
                maxFeeAmount: paymentFlow.btcProtocolFee,
            });
        // Fire-and-forget update to 'lnPayments' collection
        if (!(payResult instanceof lightning_1.LnAlreadyPaidError)) {
            (0, mongoose_1.LnPaymentsRepository)().persistNew({
                paymentHash: decodedInvoice.paymentHash,
                paymentRequest: decodedInvoice.paymentRequest,
                sentFromPubkey: outgoingNodePubkey || lndService.defaultPubkey(),
            });
            if (!(payResult instanceof Error))
                LedgerFacade.updateMetadataByHash({
                    hash: paymentHash,
                    revealedPreImage: payResult.revealedPreImage,
                });
        }
        if (payResult instanceof lightning_1.LnPaymentPendingError) {
            paymentFlow.paymentSentAndPending = true;
            paymentFlowRepo.updateLightningPaymentFlow(paymentFlow);
            return lightning_1.PaymentSendStatus.Pending;
        }
        const settled = await LedgerFacade.settlePendingLnSend(paymentHash);
        if (settled instanceof Error)
            return settled;
        if (payResult instanceof Error) {
            const voided = await LedgerFacade.recordLnSendRevert({
                journalId,
                paymentHash,
            });
            if (voided instanceof Error)
                return voided;
            if (payResult instanceof lightning_1.LnAlreadyPaidError) {
                return lightning_1.PaymentSendStatus.AlreadyPaid;
            }
            return payResult;
        }
        if (!rawRoute) {
            const reimbursed = await _app_1.Wallets.reimburseFee({
                paymentFlow,
                journalId,
                actualFee: payResult.roundedUpFee,
                revealedPreImage: payResult.revealedPreImage,
            });
            if (reimbursed instanceof Error)
                return reimbursed;
        }
        return lightning_1.PaymentSendStatus.Success;
    });
};
//# sourceMappingURL=send-lightning.js.map