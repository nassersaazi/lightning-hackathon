"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDefaultWalletBalanceToUsers = void 0;
const bitcoin_1 = require("../../domain/bitcoin");
const shared_1 = require("../../domain/shared");
const fiat_1 = require("../../domain/fiat");
const prices_1 = require("../prices");
const ledger_1 = require("../../services/ledger");
const tracing_1 = require("../../services/tracing");
const notifications_1 = require("../../services/notifications");
const mongoose_1 = require("../../services/mongoose");
const active_accounts_1 = require("./active-accounts");
const sendDefaultWalletBalanceToUsers = async () => {
    const accounts = await (0, active_accounts_1.getRecentlyActiveAccounts)();
    if (accounts instanceof Error)
        throw accounts;
    const price = await (0, prices_1.getCurrentPrice)();
    const displayCurrencyPerSat = price instanceof Error ? undefined : price;
    const converter = displayCurrencyPerSat
        ? (0, fiat_1.DisplayCurrencyConverter)(displayCurrencyPerSat)
        : undefined;
    const notifyUser = (0, tracing_1.wrapAsyncToRunInSpan)({
        namespace: "daily-balance-notification",
        fn: async (account) => {
            const recipientUser = await (0, mongoose_1.UsersRepository)().findById(account.ownerId);
            if (recipientUser instanceof Error)
                return recipientUser;
            if (!recipientUser.deviceTokens || recipientUser.deviceTokens.length === 0)
                return;
            const wallet = await (0, mongoose_1.WalletsRepository)().findById(account.defaultWalletId);
            if (wallet instanceof Error)
                return wallet;
            const balanceAmount = await (0, ledger_1.LedgerService)().getWalletBalanceAmount(wallet);
            if (balanceAmount instanceof Error)
                return balanceAmount;
            let displayBalanceAmount;
            if (converter && wallet.currency === shared_1.WalletCurrency.Btc) {
                const amount = converter.fromSats((0, bitcoin_1.toSats)(balanceAmount.amount));
                displayBalanceAmount = { amount, currency: fiat_1.DisplayCurrency.Usd };
            }
            return (0, notifications_1.NotificationsService)().sendBalance({
                balanceAmount,
                recipientDeviceTokens: recipientUser.deviceTokens,
                displayBalanceAmount,
                recipientLanguage: recipientUser.language,
            });
        },
    });
    for (const account of accounts) {
        await notifyUser(account);
    }
};
exports.sendDefaultWalletBalanceToUsers = sendDefaultWalletBalanceToUsers;
//# sourceMappingURL=send-default-wallet-balance-to-users.js.map