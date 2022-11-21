"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceRatioForLimits = exports.newCheckWithdrawalLimits = exports.newCheckTradeIntraAccountLimits = exports.newCheckIntraledgerLimits = exports.constructPaymentFlowBuilder = void 0;
const shared_1 = require("../shared");
const _config_1 = require("../../config/index");
const accounts_1 = require("../../domain/accounts");
const errors_1 = require("../../domain/errors");
const payments_1 = require("../../domain/payments");
const shared_2 = require("../../domain/shared");
const ledger_1 = require("../../services/ledger");
const lnd_1 = require("../../services/lnd");
const mongoose_1 = require("../../services/mongoose");
const tracing_1 = require("../../services/tracing");
const _utils_1 = require("../../utils/index");
const ledger = (0, ledger_1.LedgerService)();
const constructPaymentFlowBuilder = async ({ senderWallet, invoice, uncheckedAmount, hedgeBuyUsd, hedgeSellUsd, }) => {
    const lndService = (0, lnd_1.LndService)();
    if (lndService instanceof Error)
        return lndService;
    const paymentBuilder = (0, payments_1.LightningPaymentFlowBuilder)({
        localNodeIds: lndService.listAllPubkeys(),
        flaggedPubkeys: (0, _config_1.getPubkeysToSkipProbe)(),
    });
    const builderWithInvoice = uncheckedAmount
        ? paymentBuilder.withNoAmountInvoice({
            invoice,
            uncheckedAmount,
        })
        : paymentBuilder.withInvoice(invoice);
    const builderWithSenderWallet = builderWithInvoice.withSenderWallet(senderWallet);
    let builderAfterRecipientStep;
    if (builderWithSenderWallet.isIntraLedger()) {
        const recipientDetails = await recipientDetailsFromInvoice(invoice);
        if (recipientDetails instanceof Error)
            return recipientDetails;
        builderAfterRecipientStep =
            builderWithSenderWallet.withRecipientWallet(recipientDetails);
    }
    else {
        builderAfterRecipientStep = builderWithSenderWallet.withoutRecipientWallet();
    }
    const builderWithConversion = await builderAfterRecipientStep.withConversion({
        mid: { usdFromBtc: shared_1.usdFromBtcMidPriceFn, btcFromUsd: shared_1.btcFromUsdMidPriceFn },
        hedgeBuyUsd,
        hedgeSellUsd,
    });
    const check = await builderWithConversion.usdPaymentAmount();
    if (check instanceof payments_1.InvalidZeroAmountPriceRatioInputError &&
        builderWithSenderWallet.isIntraLedger() === true) {
        return new payments_1.ZeroAmountForUsdRecipientError();
    }
    return builderWithConversion;
};
exports.constructPaymentFlowBuilder = constructPaymentFlowBuilder;
const recipientDetailsFromInvoice = async (invoice) => {
    const invoicesRepo = (0, mongoose_1.WalletInvoicesRepository)();
    const walletInvoice = await invoicesRepo.findByPaymentHash(invoice.paymentHash);
    if (walletInvoice instanceof Error)
        return walletInvoice;
    if (walletInvoice.paid)
        return new errors_1.AlreadyPaidError(walletInvoice.paymentHash);
    const { recipientWalletDescriptor: { id: recipientWalletId, currency: recipientsWalletCurrency, }, pubkey: recipientPubkey, usdAmount: usdPaymentAmount, } = walletInvoice;
    const recipientWallet = await (0, mongoose_1.WalletsRepository)().findById(recipientWalletId);
    if (recipientWallet instanceof Error)
        return recipientWallet;
    const { accountId } = recipientWallet;
    const recipientAccount = await (0, mongoose_1.AccountsRepository)().findById(accountId);
    if (recipientAccount instanceof Error)
        return recipientAccount;
    const { username: recipientUsername } = recipientAccount;
    return {
        id: recipientWalletId,
        currency: recipientsWalletCurrency,
        accountId: recipientAccount.id,
        pubkey: recipientPubkey,
        usdPaymentAmount,
        username: recipientUsername,
    };
};
const newCheckIntraledgerLimits = async ({ amount, wallet, priceRatio, }) => {
    const timestamp1Day = (0, _utils_1.timestampDaysAgo)(_config_1.ONE_DAY);
    if (timestamp1Day instanceof Error)
        return timestamp1Day;
    const walletVolume = await ledger.intraledgerTxBaseVolumeAmountSince({
        walletDescriptor: wallet,
        timestamp: timestamp1Day,
    });
    if (walletVolume instanceof Error)
        return walletVolume;
    const account = await (0, mongoose_1.AccountsRepository)().findById(wallet.accountId);
    if (account instanceof Error)
        return account;
    const accountLimits = (0, _config_1.getAccountLimits)({ level: account.level });
    const { checkIntraledger } = (0, accounts_1.AccountLimitsChecker)({
        accountLimits,
        priceRatio,
    });
    return checkIntraledger({
        amount,
        walletVolume,
    });
};
exports.newCheckIntraledgerLimits = newCheckIntraledgerLimits;
const newCheckTradeIntraAccountLimits = async ({ amount, wallet, priceRatio, }) => {
    const timestamp1Day = (0, _utils_1.timestampDaysAgo)(_config_1.ONE_DAY);
    if (timestamp1Day instanceof Error)
        return timestamp1Day;
    const walletVolume = await ledger.tradeIntraAccountTxBaseVolumeAmountSince({
        walletDescriptor: wallet,
        timestamp: timestamp1Day,
    });
    if (walletVolume instanceof Error)
        return walletVolume;
    const account = await (0, mongoose_1.AccountsRepository)().findById(wallet.accountId);
    if (account instanceof Error)
        return account;
    const accountLimits = (0, _config_1.getAccountLimits)({ level: account.level });
    const { checkTradeIntraAccount } = (0, accounts_1.AccountLimitsChecker)({
        accountLimits,
        priceRatio,
    });
    return checkTradeIntraAccount({
        amount,
        walletVolume,
    });
};
exports.newCheckTradeIntraAccountLimits = newCheckTradeIntraAccountLimits;
const newCheckWithdrawalLimits = async ({ amount, wallet, priceRatio, }) => {
    const timestamp1Day = (0, _utils_1.timestampDaysAgo)(_config_1.ONE_DAY);
    if (timestamp1Day instanceof Error)
        return timestamp1Day;
    const walletVolume = await ledger.externalPaymentVolumeAmountSince({
        walletDescriptor: wallet,
        timestamp: timestamp1Day,
    });
    if (walletVolume instanceof Error)
        return walletVolume;
    const account = await (0, mongoose_1.AccountsRepository)().findById(wallet.accountId);
    if (account instanceof Error)
        return account;
    const accountLimits = (0, _config_1.getAccountLimits)({ level: account.level });
    const { checkWithdrawal } = (0, accounts_1.AccountLimitsChecker)({
        accountLimits,
        priceRatio,
    });
    return checkWithdrawal({
        amount,
        walletVolume,
    });
};
exports.newCheckWithdrawalLimits = newCheckWithdrawalLimits;
exports.getPriceRatioForLimits = (0, tracing_1.wrapAsyncToRunInSpan)({
    namespace: "app.payments",
    fnName: "getPriceRatioForLimits",
    fn: async (paymentFlow) => {
        const amount = _config_1.MIN_SATS_FOR_PRICE_RATIO_PRECISION;
        if (paymentFlow.btcPaymentAmount.amount < amount) {
            const btcPaymentAmountForRatio = {
                amount,
                currency: shared_2.WalletCurrency.Btc,
            };
            const usdPaymentAmountForRatio = await (0, shared_1.usdFromBtcMidPriceFn)(btcPaymentAmountForRatio);
            if (usdPaymentAmountForRatio instanceof Error)
                return usdPaymentAmountForRatio;
            return (0, payments_1.PriceRatio)({
                usd: usdPaymentAmountForRatio,
                btc: btcPaymentAmountForRatio,
            });
        }
        return (0, payments_1.PriceRatio)({
            usd: paymentFlow.usdPaymentAmount,
            btc: paymentFlow.btcPaymentAmount,
        });
    },
});
//# sourceMappingURL=helpers.js.map