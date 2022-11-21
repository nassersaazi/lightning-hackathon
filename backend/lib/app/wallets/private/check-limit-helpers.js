"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkWithdrawalLimits = exports.checkIntraledgerLimits = void 0;
const _config_1 = require("../../../config/index");
const accounts_1 = require("../../../domain/accounts");
const bitcoin_1 = require("../../../domain/bitcoin");
const fiat_1 = require("../../../domain/fiat");
const shared_1 = require("../../../domain/shared");
const ledger_1 = require("../../../services/ledger");
const tracing_1 = require("../../../services/tracing");
const _utils_1 = require("../../../utils/index");
const checkIntraledgerLimits = async ({ amount, walletId, walletCurrency, account, dCConverter, }) => {
    const limitsChecker = await getLimitsChecker(account);
    if (limitsChecker instanceof Error)
        return limitsChecker;
    const ledgerService = (0, ledger_1.LedgerService)();
    const timestamp1DayAgo = (0, _utils_1.timestampDaysAgo)(_config_1.ONE_DAY);
    if (timestamp1DayAgo instanceof Error)
        return timestamp1DayAgo;
    const walletVolume = await ledgerService.intraledgerTxBaseVolumeSince({
        walletId,
        timestamp: timestamp1DayAgo,
    });
    if (walletVolume instanceof Error)
        return walletVolume;
    return limitCheckWithCurrencyConversion({
        amount,
        walletVolume,
        walletCurrency,
        dCConverter,
        limitsCheckerFn: limitsChecker.checkIntraledger,
    });
};
exports.checkIntraledgerLimits = checkIntraledgerLimits;
const checkWithdrawalLimits = async ({ amount, walletId, walletCurrency, account, dCConverter, }) => {
    const limitsChecker = await getLimitsChecker(account);
    if (limitsChecker instanceof Error)
        return limitsChecker;
    const ledgerService = (0, ledger_1.LedgerService)();
    const timestamp1DayAgo = (0, _utils_1.timestampDaysAgo)(_config_1.ONE_DAY);
    if (timestamp1DayAgo instanceof Error)
        return timestamp1DayAgo;
    const walletVolume = await ledgerService.externalPaymentVolumeSince({
        walletId,
        timestamp: timestamp1DayAgo,
    });
    if (walletVolume instanceof Error)
        return walletVolume;
    return limitCheckWithCurrencyConversion({
        amount,
        walletVolume,
        walletCurrency,
        dCConverter,
        limitsCheckerFn: limitsChecker.checkWithdrawal,
    });
};
exports.checkWithdrawalLimits = checkWithdrawalLimits;
const limitCheckWithCurrencyConversion = ({ amount, walletVolume, walletCurrency, dCConverter, limitsCheckerFn, }) => {
    const dCSatstoCents = (amount) => dCConverter.fromSatsToCents((0, bitcoin_1.toSats)(amount));
    (0, tracing_1.addAttributesToCurrentSpan)({ "txVolume.fromWalletCurrency": walletCurrency });
    if (walletCurrency === shared_1.WalletCurrency.Usd) {
        return limitsCheckerFn({
            amount: (0, fiat_1.toCents)(amount),
            walletVolume: (0, _utils_1.mapObj)(walletVolume, fiat_1.toCents),
        });
    }
    else {
        return limitsCheckerFn({
            amount: dCSatstoCents(amount),
            walletVolume: (0, _utils_1.mapObj)(walletVolume, dCSatstoCents),
        });
    }
};
const getLimitsChecker = async (account) => {
    const accountLimits = (0, _config_1.getAccountLimits)({ level: account.level });
    return (0, accounts_1.LimitsChecker)({
        accountLimits,
    });
};
//# sourceMappingURL=check-limit-helpers.js.map