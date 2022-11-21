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
exports.listWalletIds = exports.listWalletsByAccountId = exports.getWallet = void 0;
__exportStar(require("./add-invoice-for-wallet"), exports);
__exportStar(require("./create-on-chain-address"), exports);
__exportStar(require("./get-balance-for-wallet"), exports);
__exportStar(require("./get-last-on-chain-address"), exports);
__exportStar(require("./get-on-chain-fee"), exports);
__exportStar(require("./get-pending-onchain-balance-for-wallet"), exports);
__exportStar(require("./get-transaction-by-id"), exports);
__exportStar(require("./get-transactions-by-addresses"), exports);
__exportStar(require("./get-transactions-by-hash"), exports);
__exportStar(require("./get-transactions-for-wallet"), exports);
__exportStar(require("./reimburse-failed-usd"), exports);
__exportStar(require("./reimburse-fee"), exports);
__exportStar(require("./send-on-chain"), exports);
__exportStar(require("./update-on-chain-receipt"), exports);
__exportStar(require("./update-pending-invoices"), exports);
const mongoose_1 = require("../../services/mongoose");
const getWallet = async (walletId) => {
    const wallets = (0, mongoose_1.WalletsRepository)();
    return wallets.findById(walletId);
};
exports.getWallet = getWallet;
const listWalletsByAccountId = async (accountId) => {
    return (0, mongoose_1.WalletsRepository)().listByAccountId(accountId);
};
exports.listWalletsByAccountId = listWalletsByAccountId;
const listWalletIds = async (walletCurrency) => {
    const wallets = await (0, mongoose_1.WalletsRepository)().listByWalletCurrency(walletCurrency);
    if (wallets instanceof Error)
        return wallets;
    return wallets.map((wallet) => wallet.id);
};
exports.listWalletIds = listWalletIds;
//# sourceMappingURL=index.js.map