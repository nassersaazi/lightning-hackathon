"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentlyActiveAccounts = void 0;
const _config_1 = require("../../config/index");
const ledger_1 = require("../../domain/ledger");
const mongoose_1 = require("../../services/mongoose");
const ledger_2 = require("../../services/ledger");
const prices_1 = require("../prices");
const display_currency_1 = require("../../domain/fiat/display-currency");
const getRecentlyActiveAccounts = async () => {
    const unlockedAccounts = await (0, mongoose_1.AccountsRepository)().listUnlockedAccounts();
    if (unlockedAccounts instanceof Error)
        return unlockedAccounts;
    const displayCurrencyPerSat = await (0, prices_1.getCurrentPrice)();
    if (displayCurrencyPerSat instanceof Error)
        return displayCurrencyPerSat;
    const dCConverter = (0, display_currency_1.DisplayCurrencyConverter)(displayCurrencyPerSat);
    const activeAccounts = [];
    const ledger = (0, ledger_2.LedgerService)();
    const activityChecker = (0, ledger_1.ActivityChecker)({
        getVolumeFn: ledger.allTxBaseVolumeSince,
        dCConverter,
        monthlyVolumeThreshold: _config_1.USER_ACTIVENESS_MONTHLY_VOLUME_THRESHOLD,
    });
    for (const account of unlockedAccounts) {
        // FIXME: this is a very slow query (not critical as only run daily on cron currently).
        // a mongodb query would be able to get the wallet in aggregate directly
        // from medici_transactions instead
        const wallets = await (0, mongoose_1.WalletsRepository)().listByAccountId(account.id);
        if (wallets instanceof Error)
            return wallets;
        const volume = await activityChecker.aboveThreshold(wallets);
        if (volume instanceof Error)
            continue;
        if (volume) {
            activeAccounts.push(account);
        }
    }
    return activeAccounts;
};
exports.getRecentlyActiveAccounts = getRecentlyActiveAccounts;
//# sourceMappingURL=active-accounts.js.map