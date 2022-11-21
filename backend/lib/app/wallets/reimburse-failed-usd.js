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
exports.reimburseFailedUsdPayment = void 0;
const bitcoin_1 = require("../../domain/bitcoin");
const errors_1 = require("../../domain/errors");
const fiat_1 = require("../../domain/fiat");
const ledger_1 = require("../../domain/ledger");
const shared_1 = require("../../domain/shared");
const mongoose_1 = require("../../services/mongoose");
const LedgerFacade = __importStar(require("../../services/ledger/facade"));
const calc = (0, shared_1.AmountCalculator)();
const reimburseFailedUsdPayment = async ({ paymentFlow, journalId, }) => {
    const paymentHash = paymentFlow.paymentHashForFlow();
    if (paymentHash instanceof Error)
        return paymentHash;
    const metadata = {
        hash: paymentHash,
        type: ledger_1.LedgerTransactionType.Payment,
        pending: false,
        related_journal: journalId,
        usd: Number(calc.divFloor(paymentFlow.usdPaymentAmount, 100n).amount),
        satsAmount: (0, bitcoin_1.toSats)(paymentFlow.btcPaymentAmount.amount),
        centsAmount: (0, fiat_1.toCents)(paymentFlow.usdPaymentAmount.amount),
        satsFee: (0, bitcoin_1.toSats)(paymentFlow.btcProtocolFee.amount),
        centsFee: (0, fiat_1.toCents)(paymentFlow.usdProtocolFee.amount),
        displayAmount: Number(paymentFlow.usdPaymentAmount.amount),
        displayFee: Number(paymentFlow.usdProtocolFee.amount),
        displayCurrency: fiat_1.DisplayCurrency.Usd,
    };
    const txMetadata = {
        hash: paymentHash,
    };
    const walletsRepo = (0, mongoose_1.WalletsRepository)();
    const { id: recipientWalletId } = paymentFlow.senderWalletDescriptor();
    const recipientWallet = await walletsRepo.findById(recipientWalletId);
    if (recipientWallet instanceof Error)
        return recipientWallet;
    let recipientBtcWallet = recipientWallet.currency === shared_1.WalletCurrency.Btc ? recipientWallet : undefined;
    if (recipientBtcWallet === undefined) {
        const recipientWallets = await walletsRepo.listByAccountId(recipientWallet.accountId);
        if (recipientWallets instanceof Error)
            return recipientWallets;
        recipientBtcWallet = recipientWallets.find((wallet) => wallet.currency === shared_1.WalletCurrency.Btc);
        if (recipientBtcWallet === undefined) {
            return new errors_1.CouldNotFindBtcWalletForAccountError(JSON.stringify({ accountId: recipientWallet.accountId }));
        }
    }
    const btcWalletDescriptor = {
        id: recipientBtcWallet.id,
        currency: recipientBtcWallet.currency,
        accountId: recipientBtcWallet.accountId,
    };
    const result = await LedgerFacade.recordReceive({
        description: "Usd payment canceled",
        recipientWalletDescriptor: btcWalletDescriptor,
        amountToCreditReceiver: paymentFlow.totalAmountsForPayment(),
        metadata,
        txMetadata,
    });
    if (result instanceof Error)
        return result;
    return true;
};
exports.reimburseFailedUsdPayment = reimburseFailedUsdPayment;
//# sourceMappingURL=reimburse-failed-usd.js.map