"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRecipientWalletIdRateLimits = exports.addInvoiceNoAmountForRecipient = exports.addInvoiceForRecipient = exports.addInvoiceNoAmountForSelf = exports.addInvoiceForSelf = void 0;
const bitcoin_1 = require("../../domain/bitcoin");
const rate_limit_1 = require("../../domain/rate-limit");
const wallets_1 = require("../../domain/wallets");
const dealer_price_1 = require("../../services/dealer-price");
const lnd_1 = require("../../services/lnd");
const mongoose_1 = require("../../services/mongoose");
const rate_limit_2 = require("../../services/rate-limit");
const wallet_invoice_builder_1 = require("../../domain/wallet-invoices/wallet-invoice-builder");
const addInvoiceForSelf = async ({ walletId, amount, memo = "", }) => addInvoice({
    walletId,
    limitCheckFn: checkSelfWalletIdRateLimits,
    buildWIBWithAmountFn: ({ walletInvoiceBuilder, recipientWalletDescriptor, }) => walletInvoiceBuilder
        .withDescription({ description: memo })
        .generatedForSelf()
        .withRecipientWallet(recipientWalletDescriptor)
        .withAmount(amount),
});
exports.addInvoiceForSelf = addInvoiceForSelf;
const addInvoiceNoAmountForSelf = async ({ walletId, memo = "", }) => addInvoice({
    walletId,
    limitCheckFn: checkSelfWalletIdRateLimits,
    buildWIBWithAmountFn: ({ walletInvoiceBuilder, recipientWalletDescriptor, }) => walletInvoiceBuilder
        .withDescription({ description: memo })
        .generatedForSelf()
        .withRecipientWallet(recipientWalletDescriptor)
        .withoutAmount(),
});
exports.addInvoiceNoAmountForSelf = addInvoiceNoAmountForSelf;
const addInvoiceForRecipient = async ({ recipientWalletId, amount, memo = "", descriptionHash, }) => addInvoice({
    walletId: recipientWalletId,
    limitCheckFn: exports.checkRecipientWalletIdRateLimits,
    buildWIBWithAmountFn: ({ walletInvoiceBuilder, recipientWalletDescriptor, }) => walletInvoiceBuilder
        .withDescription({ description: memo, descriptionHash })
        .generatedForRecipient()
        .withRecipientWallet(recipientWalletDescriptor)
        .withAmount(amount),
});
exports.addInvoiceForRecipient = addInvoiceForRecipient;
const addInvoiceNoAmountForRecipient = async ({ recipientWalletId, memo = "", }) => addInvoice({
    walletId: recipientWalletId,
    limitCheckFn: exports.checkRecipientWalletIdRateLimits,
    buildWIBWithAmountFn: ({ walletInvoiceBuilder, recipientWalletDescriptor, }) => walletInvoiceBuilder
        .withDescription({ description: memo })
        .generatedForRecipient()
        .withRecipientWallet(recipientWalletDescriptor)
        .withoutAmount(),
});
exports.addInvoiceNoAmountForRecipient = addInvoiceNoAmountForRecipient;
const addInvoice = async ({ walletId, limitCheckFn, buildWIBWithAmountFn, }) => {
    const walletIdChecked = (0, wallets_1.checkedToWalletId)(walletId);
    if (walletIdChecked instanceof Error)
        return walletIdChecked;
    const wallet = await (0, mongoose_1.WalletsRepository)().findById(walletIdChecked);
    if (wallet instanceof Error)
        return wallet;
    const limitOk = await limitCheckFn(wallet.accountId);
    if (limitOk instanceof Error)
        return limitOk;
    const lndService = (0, lnd_1.LndService)();
    if (lndService instanceof Error)
        return lndService;
    const dealer = (0, dealer_price_1.NewDealerPriceService)();
    const walletInvoiceBuilder = (0, wallet_invoice_builder_1.WalletInvoiceBuilder)({
        dealerBtcFromUsd: dealer.getSatsFromCentsForFutureBuy,
        lnRegisterInvoice: (args) => lndService.registerInvoice({ ...args, sats: (0, bitcoin_1.toSats)(args.btcPaymentAmount.amount) }),
    });
    if (walletInvoiceBuilder instanceof Error)
        return walletInvoiceBuilder;
    const walletIBWithAmount = await buildWIBWithAmountFn({
        walletInvoiceBuilder,
        recipientWalletDescriptor: wallet,
    });
    if (walletIBWithAmount instanceof Error)
        return walletIBWithAmount;
    const invoice = await walletIBWithAmount.registerInvoice();
    if (invoice instanceof Error)
        return invoice;
    const { walletInvoice, lnInvoice } = invoice;
    const persistedInvoice = await (0, mongoose_1.WalletInvoicesRepository)().persistNew(walletInvoice);
    if (persistedInvoice instanceof Error)
        return persistedInvoice;
    return lnInvoice;
};
const checkSelfWalletIdRateLimits = async (accountId) => (0, rate_limit_2.consumeLimiter)({
    rateLimitConfig: rate_limit_1.RateLimitConfig.invoiceCreate,
    keyToConsume: accountId,
});
// TODO: remove export once core has been deleted.
const checkRecipientWalletIdRateLimits = async (accountId) => (0, rate_limit_2.consumeLimiter)({
    rateLimitConfig: rate_limit_1.RateLimitConfig.invoiceCreateForRecipient,
    keyToConsume: accountId,
});
exports.checkRecipientWalletIdRateLimits = checkRecipientWalletIdRateLimits;
//# sourceMappingURL=add-invoice-for-wallet.js.map