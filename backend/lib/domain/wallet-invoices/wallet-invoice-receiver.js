"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletInvoiceReceiver = void 0;
const shared_1 = require("../shared");
const WalletInvoiceReceiver = async ({ walletInvoice, receivedBtc, usdFromBtc, usdFromBtcMidPrice, }) => {
    const btcToCreditReceiver = receivedBtc;
    if (walletInvoice.recipientWalletDescriptor.currency === shared_1.WalletCurrency.Btc) {
        const usdToCreditReceiver = await usdFromBtcMidPrice(btcToCreditReceiver);
        if (usdToCreditReceiver instanceof Error)
            return usdToCreditReceiver;
        return {
            ...walletInvoice,
            btcToCreditReceiver,
            usdToCreditReceiver,
            recipientWalletDescriptor: walletInvoice.recipientWalletDescriptor,
            ...shared_1.ZERO_BANK_FEE,
            receivedAmount: () => walletInvoice.recipientWalletDescriptor.currency === shared_1.WalletCurrency.Btc
                ? btcToCreditReceiver
                : usdToCreditReceiver,
        };
    }
    if (walletInvoice.usdAmount) {
        const usdToCreditReceiver = walletInvoice.usdAmount;
        return {
            ...walletInvoice,
            btcToCreditReceiver,
            usdToCreditReceiver,
            recipientWalletDescriptor: walletInvoice.recipientWalletDescriptor,
            ...shared_1.ZERO_BANK_FEE,
            receivedAmount: () => walletInvoice.recipientWalletDescriptor.currency === shared_1.WalletCurrency.Btc
                ? btcToCreditReceiver
                : usdToCreditReceiver,
        };
    }
    const usdToCreditReceiver = await usdFromBtc(btcToCreditReceiver);
    if (usdToCreditReceiver instanceof Error)
        return usdToCreditReceiver;
    return {
        ...walletInvoice,
        usdToCreditReceiver,
        btcToCreditReceiver,
        recipientWalletDescriptor: walletInvoice.recipientWalletDescriptor,
        ...shared_1.ZERO_BANK_FEE,
        receivedAmount: () => walletInvoice.recipientWalletDescriptor.currency === shared_1.WalletCurrency.Btc
            ? btcToCreditReceiver
            : usdToCreditReceiver,
    };
};
exports.WalletInvoiceReceiver = WalletInvoiceReceiver;
//# sourceMappingURL=wallet-invoice-receiver.js.map