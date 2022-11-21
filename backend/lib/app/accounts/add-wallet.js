"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWalletIfNonexistent = exports.addWallet = void 0;
const mongoose_1 = require("../../services/mongoose");
const addWallet = async ({ accountId, type, currency, }) => {
    const wallet = await (0, mongoose_1.WalletsRepository)().persistNew({
        accountId,
        type,
        currency,
    });
    if (wallet instanceof Error)
        return wallet;
    return wallet;
};
exports.addWallet = addWallet;
const addWalletIfNonexistent = async ({ accountId, type, currency, }) => {
    const wallets = await (0, mongoose_1.WalletsRepository)().listByAccountId(accountId);
    if (wallets instanceof Error)
        return wallets;
    const walletOfTypeAndCurrency = wallets.find((wallet) => wallet.currency === currency && wallet.type === type);
    if (walletOfTypeAndCurrency)
        return walletOfTypeAndCurrency;
    return (0, mongoose_1.WalletsRepository)().persistNew({
        accountId,
        type,
        currency,
    });
};
exports.addWalletIfNonexistent = addWalletIfNonexistent;
//# sourceMappingURL=add-wallet.js.map