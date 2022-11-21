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
exports.WithdrawalFeePriceMethod = exports.checkedToWalletId = exports.WalletIdRegex = exports.WalletTransactionHistory = void 0;
const errors_1 = require("../errors");
__exportStar(require("./deposit-fee-calculator"), exports);
var tx_history_1 = require("./tx-history");
Object.defineProperty(exports, "WalletTransactionHistory", { enumerable: true, get: function () { return tx_history_1.WalletTransactionHistory; } });
__exportStar(require("./tx-methods"), exports);
__exportStar(require("./tx-status"), exports);
__exportStar(require("./withdrawal-fee-calculator"), exports);
__exportStar(require("./payment-input-validator"), exports);
__exportStar(require("./primitives"), exports);
const UuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
exports.WalletIdRegex = UuidRegex;
const checkedToWalletId = (walletId) => {
    if (!walletId.match(exports.WalletIdRegex)) {
        return new errors_1.InvalidWalletId(walletId);
    }
    return walletId;
};
exports.checkedToWalletId = checkedToWalletId;
exports.WithdrawalFeePriceMethod = {
    flat: "flat",
    proportionalOnImbalance: "proportionalOnImbalance",
};
//# sourceMappingURL=index.js.map