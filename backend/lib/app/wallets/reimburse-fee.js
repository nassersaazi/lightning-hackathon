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
exports.reimburseFee = void 0;
const bitcoin_1 = require("../../domain/bitcoin");
const fiat_1 = require("../../domain/fiat");
const ledger_1 = require("../../domain/ledger");
const fee_reimbursement_1 = require("../../domain/ledger/fee-reimbursement");
const payments_1 = require("../../domain/payments");
const shared_1 = require("../../domain/shared");
const LedgerFacade = __importStar(require("../../services/ledger/facade"));
const logger_1 = require("../../services/logger");
const reimburseFee = async ({ paymentFlow, journalId, actualFee, revealedPreImage, }) => {
    const actualFeeAmount = (0, shared_1.paymentAmountFromNumber)({
        amount: actualFee,
        currency: shared_1.WalletCurrency.Btc,
    });
    if (actualFeeAmount instanceof Error)
        return actualFeeAmount;
    const maxFeeAmounts = {
        btc: paymentFlow.btcProtocolFee,
        usd: paymentFlow.usdProtocolFee,
    };
    const priceRatio = (0, payments_1.PriceRatio)(paymentFlow.paymentAmounts());
    if (priceRatio instanceof Error)
        return priceRatio;
    const feeDifference = (0, fee_reimbursement_1.FeeReimbursement)({
        prepaidFeeAmount: maxFeeAmounts,
        priceRatio,
    }).getReimbursement(actualFeeAmount);
    if (feeDifference instanceof Error) {
        logger_1.baseLogger.warn({ maxFee: maxFeeAmounts, actualFee: actualFeeAmount }, `Invalid reimbursement fee`);
        return true;
    }
    // TODO: only reimburse fees is this is above a (configurable) threshold
    // ie: adding an entry for 1 sat fees may not be the best scalability wise for the db
    if (feeDifference.btc.amount === 0n) {
        return true;
    }
    const displayCentsPerSat = priceRatio.usdPerSat();
    const converter = (0, fiat_1.NewDisplayCurrencyConverter)(displayCentsPerSat);
    const reimburseAmountDisplayCurrency = converter.fromUsdAmount(feeDifference.usd);
    const paymentHash = paymentFlow.paymentHashForFlow();
    if (paymentHash instanceof Error)
        return paymentHash;
    const metadata = {
        hash: paymentHash,
        type: ledger_1.LedgerTransactionType.LnFeeReimbursement,
        pending: false,
        related_journal: journalId,
        usd: (reimburseAmountDisplayCurrency / 100),
        satsAmount: (0, bitcoin_1.toSats)(feeDifference.btc.amount),
        centsAmount: (0, fiat_1.toCents)(feeDifference.usd.amount),
        satsFee: (0, bitcoin_1.toSats)(0),
        centsFee: (0, fiat_1.toCents)(0),
        displayAmount: reimburseAmountDisplayCurrency,
        displayFee: 0,
        displayCurrency: fiat_1.DisplayCurrency.Usd,
    };
    const txMetadata = {
        hash: paymentHash,
        revealedPreImage,
    };
    logger_1.baseLogger.info({
        feeDifference,
        maxFee: maxFeeAmounts,
        actualFee,
        paymentHash: paymentFlow.paymentHash,
    }, "logging a fee difference");
    const result = await LedgerFacade.recordReceive({
        description: "fee reimbursement",
        recipientWalletDescriptor: paymentFlow.senderWalletDescriptor(),
        amountToCreditReceiver: {
            usd: feeDifference.usd,
            btc: feeDifference.btc,
        },
        metadata,
        txMetadata,
    });
    if (result instanceof Error)
        return result;
    return true;
};
exports.reimburseFee = reimburseFee;
//# sourceMappingURL=reimburse-fee.js.map