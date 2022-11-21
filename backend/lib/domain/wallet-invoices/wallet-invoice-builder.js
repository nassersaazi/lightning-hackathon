"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIBWithAmount = exports.WIBWithRecipient = exports.WIBWithOrigin = exports.WIBWithDescription = exports.WalletInvoiceBuilder = void 0;
const lightning_1 = require("../bitcoin/lightning");
const payments_1 = require("../payments");
const shared_1 = require("../shared");
const errors_1 = require("./errors");
const WalletInvoiceBuilder = (config) => {
    const withDescription = ({ description, descriptionHash, }) => {
        return (0, exports.WIBWithDescription)({
            ...config,
            description,
            descriptionHash,
        });
    };
    return {
        withDescription,
    };
};
exports.WalletInvoiceBuilder = WalletInvoiceBuilder;
const WIBWithDescription = (state) => {
    const generatedForRecipient = () => (0, exports.WIBWithOrigin)({ ...state, selfGenerated: false });
    const generatedForSelf = () => (0, exports.WIBWithOrigin)({ ...state, selfGenerated: true });
    return {
        generatedForRecipient,
        generatedForSelf,
    };
};
exports.WIBWithDescription = WIBWithDescription;
const WIBWithOrigin = (state) => {
    const withRecipientWallet = (recipientWallet) => (0, exports.WIBWithRecipient)({ ...state, recipientWalletDescriptor: recipientWallet });
    return {
        withRecipientWallet,
    };
};
exports.WIBWithOrigin = WIBWithOrigin;
const WIBWithRecipient = (state) => {
    const withAmount = async (uncheckedAmount) => {
        if (state.recipientWalletDescriptor.currency === shared_1.WalletCurrency.Usd) {
            const usdAmount = (0, payments_1.checkedToUsdPaymentAmount)(uncheckedAmount);
            if (usdAmount instanceof Error)
                return usdAmount;
            const btcAmount = await state.dealerBtcFromUsd(usdAmount);
            if (btcAmount instanceof Error)
                return btcAmount;
            const invoiceExpiration = (0, lightning_1.invoiceExpirationForCurrency)(shared_1.WalletCurrency.Usd, new Date());
            return (0, exports.WIBWithAmount)({
                ...state,
                hasAmount: true,
                btcAmount,
                usdAmount,
                invoiceExpiration,
            });
        }
        const invoiceExpiration = (0, lightning_1.invoiceExpirationForCurrency)(shared_1.WalletCurrency.Btc, new Date());
        const btcAmount = (0, payments_1.checkedToBtcPaymentAmount)(uncheckedAmount);
        if (btcAmount instanceof Error)
            return btcAmount;
        return (0, exports.WIBWithAmount)({ ...state, hasAmount: true, btcAmount, invoiceExpiration });
    };
    const withoutAmount = async () => {
        const invoiceExpiration = (0, lightning_1.invoiceExpirationForCurrency)(shared_1.WalletCurrency.Btc, new Date());
        return (0, exports.WIBWithAmount)({
            ...state,
            hasAmount: false,
            btcAmount: shared_1.ZERO_SATS,
            invoiceExpiration,
        });
    };
    return {
        withAmount,
        withoutAmount,
    };
};
exports.WIBWithRecipient = WIBWithRecipient;
const WIBWithAmount = (state) => {
    const registerInvoice = async () => {
        const { secret, paymentHash } = (0, lightning_1.getSecretAndPaymentHash)();
        const registeredInvoice = await state.lnRegisterInvoice({
            paymentHash,
            description: state.description,
            descriptionHash: state.descriptionHash,
            btcPaymentAmount: state.btcAmount,
            expiresAt: state.invoiceExpiration,
        });
        if (registeredInvoice instanceof Error)
            return registeredInvoice;
        if (paymentHash !== registeredInvoice.invoice.paymentHash) {
            return new errors_1.InvalidWalletInvoiceBuilderStateError();
        }
        const walletInvoice = {
            paymentHash,
            secret,
            selfGenerated: state.selfGenerated,
            pubkey: registeredInvoice.pubkey,
            usdAmount: state.usdAmount,
            recipientWalletDescriptor: state.recipientWalletDescriptor,
            paid: false,
        };
        return {
            walletInvoice,
            lnInvoice: registeredInvoice.invoice,
        };
    };
    return {
        registerInvoice,
    };
};
exports.WIBWithAmount = WIBWithAmount;
//# sourceMappingURL=wallet-invoice-builder.js.map