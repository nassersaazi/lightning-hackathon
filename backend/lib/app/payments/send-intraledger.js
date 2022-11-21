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
exports.intraledgerPaymentSendWalletId = void 0;
const _config_1 = require("../../config/index");
const shared_1 = require("../../domain/shared");
const wallets_1 = require("../../domain/wallets");
const accounts_1 = require("../../domain/accounts");
const fiat_1 = require("../../domain/fiat");
const lightning_1 = require("../../domain/bitcoin/lightning");
const payments_1 = require("../../domain/payments");
const tracing_1 = require("../../services/tracing");
const dealer_price_1 = require("../../services/dealer-price");
const mongoose_1 = require("../../services/mongoose");
const lock_1 = require("../../services/lock");
const ledger_1 = require("../../services/ledger");
const LedgerFacade = __importStar(require("../../services/ledger/facade"));
const notifications_1 = require("../../services/notifications");
const lock_2 = require("../../domain/lock");
const _app_1 = require("../index");
const shared_2 = require("../shared");
const helpers_1 = require("./helpers");
const dealer = (0, dealer_price_1.NewDealerPriceService)();
const intraledgerPaymentSendWalletId = async ({ recipientWalletId: uncheckedRecipientWalletId, senderAccount, amount: uncheckedAmount, memo, senderWalletId: uncheckedSenderWalletId, }) => {
    const validatedPaymentInputs = await validateIntraledgerPaymentInputs({
        uncheckedSenderWalletId,
        uncheckedRecipientWalletId,
        senderAccount,
    });
    if (validatedPaymentInputs instanceof Error)
        return validatedPaymentInputs;
    const { senderWallet, recipientWallet, recipientAccount } = validatedPaymentInputs;
    const { id: recipientWalletId, currency: recipientWalletCurrency } = recipientWallet;
    const { id: recipientAccountId, username: recipientUsername } = recipientAccount;
    const paymentBuilder = (0, payments_1.LightningPaymentFlowBuilder)({
        localNodeIds: [],
        flaggedPubkeys: (0, _config_1.getPubkeysToSkipProbe)(),
    });
    const builderWithInvoice = paymentBuilder.withoutInvoice({
        uncheckedAmount,
        description: memo || "",
    });
    const builderWithSenderWallet = builderWithInvoice.withSenderWallet(senderWallet);
    const recipientDetailsForBuilder = {
        id: recipientWalletId,
        currency: recipientWalletCurrency,
        accountId: recipientAccountId,
        username: recipientUsername,
        pubkey: undefined,
        usdPaymentAmount: undefined,
    };
    const builderAfterRecipientStep = builderWithSenderWallet.withRecipientWallet(recipientDetailsForBuilder);
    const builderWithConversion = builderAfterRecipientStep.withConversion({
        mid: { usdFromBtc: shared_2.usdFromBtcMidPriceFn, btcFromUsd: shared_2.btcFromUsdMidPriceFn },
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
    const paymentFlow = await builderWithConversion.withoutRoute();
    if (paymentFlow instanceof payments_1.InvalidZeroAmountPriceRatioInputError) {
        return new payments_1.ZeroAmountForUsdRecipientError();
    }
    if (paymentFlow instanceof Error)
        return paymentFlow;
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.intraLedger.inputAmount": paymentFlow.inputAmount.toString(),
        "payment.intraLedger.hash": paymentFlow.intraLedgerHash,
        "payment.intraLedger.description": memo || "",
    });
    const paymentSendStatus = await executePaymentViaIntraledger({
        paymentFlow,
        senderAccount,
        senderWallet,
        recipientAccount,
        recipientWallet,
        memo,
    });
    if (paymentSendStatus instanceof Error)
        return paymentSendStatus;
    if (senderAccount.id !== recipientAccount.id) {
        const addContactResult = await addContactsAfterSend({
            senderAccount,
            recipientAccount,
        });
        if (addContactResult instanceof Error) {
            (0, tracing_1.recordExceptionInCurrentSpan)({ error: addContactResult, level: shared_1.ErrorLevel.Warn });
        }
    }
    return paymentSendStatus;
};
exports.intraledgerPaymentSendWalletId = intraledgerPaymentSendWalletId;
const validateIntraledgerPaymentInputs = async ({ uncheckedSenderWalletId, uncheckedRecipientWalletId, senderAccount, }) => {
    const senderWalletId = (0, wallets_1.checkedToWalletId)(uncheckedSenderWalletId);
    if (senderWalletId instanceof Error)
        return senderWalletId;
    const senderWallet = await (0, mongoose_1.WalletsRepository)().findById(senderWalletId);
    if (senderWallet instanceof Error)
        return senderWallet;
    const accountValidator = (0, accounts_1.AccountValidator)(senderAccount);
    if (accountValidator instanceof Error)
        return accountValidator;
    const validateWallet = accountValidator.validateWalletForAccount(senderWallet);
    if (validateWallet instanceof Error)
        return validateWallet;
    const recipientWalletId = (0, wallets_1.checkedToWalletId)(uncheckedRecipientWalletId);
    if (recipientWalletId instanceof Error)
        return recipientWalletId;
    const recipientWallet = await (0, mongoose_1.WalletsRepository)().findById(recipientWalletId);
    if (recipientWallet instanceof Error)
        return recipientWallet;
    const { accountId: recipientAccountId } = recipientWallet;
    const recipientAccount = await (0, mongoose_1.AccountsRepository)().findById(recipientAccountId);
    if (recipientAccount instanceof Error)
        return recipientAccount;
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.intraLedger.senderWalletId": senderWalletId,
        "payment.intraLedger.senderWalletCurrency": senderWallet.currency,
        "payment.intraLedger.recipientWalletId": recipientWalletId,
        "payment.intraLedger.recipientWalletCurrency": recipientWallet.currency,
    });
    return {
        senderWallet,
        recipientWallet,
        recipientAccount,
    };
};
const executePaymentViaIntraledger = async ({ paymentFlow, senderAccount, senderWallet, recipientAccount, recipientWallet, memo, }) => {
    (0, tracing_1.addAttributesToCurrentSpan)({
        "payment.settlement_method": wallets_1.SettlementMethod.IntraLedger,
    });
    const priceRatioForLimits = await (0, helpers_1.getPriceRatioForLimits)(paymentFlow);
    if (priceRatioForLimits instanceof Error)
        return priceRatioForLimits;
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
    const { recipientWalletId, recipientWalletCurrency, recipientUsername } = paymentFlow.recipientDetails();
    if (!(recipientWalletId && recipientWalletCurrency)) {
        return new payments_1.InvalidLightningPaymentFlowBuilderStateError("Expected recipient details missing");
    }
    return (0, lock_1.LockService)().lockWalletId(senderWallet.id, async (signal) => {
        const balance = await (0, ledger_1.LedgerService)().getWalletBalanceAmount(senderWallet);
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
            metadata = LedgerFacade.WalletIdTradeIntraAccountLedgerMetadata({
                paymentFlow,
                amountDisplayCurrency: converter.fromUsdAmount(paymentFlow.usdPaymentAmount),
                feeDisplayCurrency: 0,
                displayCurrency: fiat_1.DisplayCurrency.Usd,
                memoOfPayer: memo || undefined,
            });
        }
        else {
            ;
            ({ metadata, debitAccountAdditionalMetadata: additionalDebitMetadata } =
                LedgerFacade.WalletIdIntraledgerLedgerMetadata({
                    paymentFlow,
                    amountDisplayCurrency: converter.fromUsdAmount(paymentFlow.usdPaymentAmount),
                    feeDisplayCurrency: 0,
                    displayCurrency: fiat_1.DisplayCurrency.Usd,
                    memoOfPayer: memo || undefined,
                    senderUsername: senderAccount.username,
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
        const totalSendAmounts = paymentFlow.totalAmountsForPayment();
        const recipientUser = await (0, mongoose_1.UsersRepository)().findById(recipientAccount.ownerId);
        if (recipientUser instanceof Error)
            return recipientUser;
        let amount = totalSendAmounts.btc.amount;
        if (recipientWalletCurrency === shared_1.WalletCurrency.Usd) {
            amount = totalSendAmounts.usd.amount;
        }
        const notificationsService = (0, notifications_1.NotificationsService)();
        notificationsService.intraLedgerTxReceived({
            recipientAccountId: recipientWallet.accountId,
            recipientWalletId: recipientWallet.id,
            recipientDeviceTokens: recipientUser.deviceTokens,
            recipientLanguage: recipientUser.language,
            paymentAmount: { amount, currency: recipientWallet.currency },
            displayPaymentAmount: { amount: metadata.usd, currency: fiat_1.DisplayCurrency.Usd },
        });
        return lightning_1.PaymentSendStatus.Success;
    });
};
const addContactsAfterSend = async ({ senderAccount, recipientAccount, }) => {
    if (!(senderAccount.contactEnabled && recipientAccount.contactEnabled)) {
        return true;
    }
    if (recipientAccount.username) {
        const addContactToPayerResult = await _app_1.Accounts.addNewContact({
            accountId: senderAccount.id,
            contactUsername: recipientAccount.username,
        });
        if (addContactToPayerResult instanceof Error)
            return addContactToPayerResult;
    }
    if (senderAccount.username) {
        const addContactToPayeeResult = await _app_1.Accounts.addNewContact({
            accountId: recipientAccount.id,
            contactUsername: senderAccount.username,
        });
        if (addContactToPayeeResult instanceof Error)
            return addContactToPayeeResult;
    }
    return true;
};
//# sourceMappingURL=send-intraledger.js.map