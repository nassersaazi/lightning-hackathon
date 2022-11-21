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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputAmountFromLedgerTransaction = exports.checkedToLedgerTransactionId = exports.LedgerTransactionIdRegex = exports.isOnChainTransaction = exports.LedgerTransactionType = exports.toWalletId = exports.toLiabilitiesWalletId = exports.liabilitiesMainAccount = void 0;
const errors_1 = require("../errors");
const shared_1 = require("../shared");
const safe_1 = require("../shared/safe");
__exportStar(require("./errors"), exports);
__exportStar(require("./activity-checker"), exports);
exports.liabilitiesMainAccount = "Liabilities";
const toLiabilitiesWalletId = (walletId) => `${exports.liabilitiesMainAccount}:${walletId}`;
exports.toLiabilitiesWalletId = toLiabilitiesWalletId;
const toWalletId = (walletIdPath) => {
    const path = walletIdPath.split(":");
    if (Array.isArray(path) &&
        path.length === 2 &&
        path[0] === exports.liabilitiesMainAccount &&
        path[1]) {
        return path[1];
    }
    return undefined;
};
exports.toWalletId = toWalletId;
exports.LedgerTransactionType = {
    // External
    Invoice: "invoice",
    Payment: "payment",
    LnFeeReimbursement: "fee_reimbursement",
    OnchainReceipt: "onchain_receipt",
    OnchainPayment: "onchain_payment",
    // Internal
    IntraLedger: "on_us",
    LnIntraLedger: "ln_on_us",
    OnchainIntraLedger: "onchain_on_us",
    WalletIdTradeIntraAccount: "self_trade",
    LnTradeIntraAccount: "ln_self_trade",
    OnChainTradeIntraAccount: "onchain_self_trade",
    // Admin
    Fee: "fee",
    ToColdStorage: "to_cold_storage",
    ToHotWallet: "to_hot_wallet",
    Escrow: "escrow",
    // TODO: rename. should be routing_revenue
    RoutingRevenue: "routing_fee", // channel-related
};
const isOnChainTransaction = (type) => type === exports.LedgerTransactionType.OnchainIntraLedger ||
    type === exports.LedgerTransactionType.OnChainTradeIntraAccount ||
    type === exports.LedgerTransactionType.OnchainReceipt ||
    type === exports.LedgerTransactionType.OnchainPayment;
exports.isOnChainTransaction = isOnChainTransaction;
exports.LedgerTransactionIdRegex = /^[0-9a-fA-F]{24}$/i;
const checkedToLedgerTransactionId = (ledgerTransactionId) => {
    if (ledgerTransactionId && ledgerTransactionId.match(exports.LedgerTransactionIdRegex)) {
        return ledgerTransactionId;
    }
    return new errors_1.InvalidLedgerTransactionId(ledgerTransactionId);
};
exports.checkedToLedgerTransactionId = checkedToLedgerTransactionId;
const inputAmountFromLedgerTransaction = (txn) => {
    const fee = txn.currency === shared_1.WalletCurrency.Usd ? txn.centsFee : txn.satsFee;
    if (fee === undefined)
        return new errors_1.InvalidLedgerTransactionStateError();
    return (0, safe_1.safeBigInt)(txn.debit - fee);
};
exports.inputAmountFromLedgerTransaction = inputAmountFromLedgerTransaction;
//# sourceMappingURL=index.js.map