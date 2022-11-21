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
exports.getUsernameFromWalletId = exports.getBusinessMapMarkers = exports.hasPermissions = exports.getAccountFromKratosUserId = exports.getAccount = void 0;
const mongoose_1 = require("../../services/mongoose");
__exportStar(require("./get-account-transactions-for-contact"), exports);
__exportStar(require("./update-account-level"), exports);
__exportStar(require("./update-account-status"), exports);
__exportStar(require("./update-business-map-info"), exports);
__exportStar(require("./send-default-wallet-balance-to-users"), exports);
__exportStar(require("./add-earn"), exports);
__exportStar(require("./set-username"), exports);
__exportStar(require("./username-available"), exports);
__exportStar(require("./get-contact-by-username"), exports);
__exportStar(require("./update-contact-alias"), exports);
__exportStar(require("./add-new-contact"), exports);
__exportStar(require("./update-default-walletid"), exports);
__exportStar(require("./get-csv-for-account"), exports);
__exportStar(require("./get-transactions-for-account"), exports);
__exportStar(require("./add-wallet"), exports);
__exportStar(require("./create-account"), exports);
const accounts = (0, mongoose_1.AccountsRepository)();
const getAccount = async (accountId) => {
    return accounts.findById(accountId);
};
exports.getAccount = getAccount;
const getAccountFromKratosUserId = async (kratosUserId) => {
    return accounts.findByKratosUserId(kratosUserId);
};
exports.getAccountFromKratosUserId = getAccountFromKratosUserId;
const hasPermissions = async (accountId, walletId) => {
    const wallet = await (0, mongoose_1.WalletsRepository)().findById(walletId);
    if (wallet instanceof Error)
        return wallet;
    return accountId === wallet.accountId;
};
exports.hasPermissions = hasPermissions;
const getBusinessMapMarkers = async () => {
    return accounts.listBusinessesForMap();
};
exports.getBusinessMapMarkers = getBusinessMapMarkers;
const getUsernameFromWalletId = async (walletId) => {
    const wallet = await (0, mongoose_1.WalletsRepository)().findById(walletId);
    if (wallet instanceof Error)
        return wallet;
    const account = await accounts.findById(wallet.accountId);
    if (account instanceof Error)
        return account;
    return account.username;
};
exports.getUsernameFromWalletId = getUsernameFromWalletId;
//# sourceMappingURL=index.js.map