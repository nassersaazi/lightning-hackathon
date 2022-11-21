"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFALimitsChecker = exports.AccountLimitsChecker = void 0;
const errors_1 = require("../errors");
const shared_1 = require("../shared");
const tracing_1 = require("../../services/tracing");
const checkLimitBase = ({ limitName, limitAmount, limitError, limitErrMsg, priceRatio, }) => async ({ amount, walletVolume, }) => {
    const volumeInUsdAmount = walletVolume.outgoingBaseAmount.currency === shared_1.WalletCurrency.Btc
        ? await priceRatio.convertFromBtc(walletVolume.outgoingBaseAmount)
        : walletVolume.outgoingBaseAmount;
    const limit = (0, shared_1.paymentAmountFromNumber)({
        amount: limitAmount,
        currency: shared_1.WalletCurrency.Usd,
    });
    if (limit instanceof Error)
        return limit;
    (0, tracing_1.addAttributesToCurrentSpan)({
        "txVolume.outgoingInBase": `${volumeInUsdAmount.amount}`,
        "txVolume.threshold": `${limit.amount}`,
        "txVolume.amountInBase": `${amount.amount}`,
        "txVolume.limitCheck": limitName,
    });
    const remainingLimit = limit.amount - volumeInUsdAmount.amount;
    if (remainingLimit < amount.amount) {
        return new limitError(limitErrMsg);
    }
    return true;
};
const AccountLimitsChecker = ({ accountLimits, priceRatio, }) => ({
    checkIntraledger: checkLimitBase({
        limitName: "checkIntraledger",
        limitAmount: accountLimits.intraLedgerLimit,
        limitError: errors_1.IntraledgerLimitsExceededError,
        limitErrMsg: `Cannot transfer more than ${accountLimits.intraLedgerLimit} cents in 24 hours`,
        priceRatio,
    }),
    checkWithdrawal: checkLimitBase({
        limitName: "checkWithdrawal",
        limitAmount: accountLimits.withdrawalLimit,
        limitError: errors_1.WithdrawalLimitsExceededError,
        limitErrMsg: `Cannot transfer more than ${accountLimits.withdrawalLimit} cents in 24 hours`,
        priceRatio,
    }),
    checkTradeIntraAccount: checkLimitBase({
        limitName: "checkTradeIntraAccount",
        limitAmount: accountLimits.tradeIntraAccountLimit,
        limitError: errors_1.TradeIntraAccountLimitsExceededError,
        limitErrMsg: `Cannot transfer more than ${accountLimits.tradeIntraAccountLimit} cents in 24 hours`,
        priceRatio,
    }),
});
exports.AccountLimitsChecker = AccountLimitsChecker;
const TwoFALimitsChecker = ({ twoFALimits, priceRatio, }) => ({
    checkTwoFA: checkLimitBase({
        limitName: "checkTwoFA",
        limitAmount: twoFALimits.threshold,
        limitError: errors_1.TwoFALimitsExceededError,
        limitErrMsg: undefined,
        priceRatio,
    }),
});
exports.TwoFALimitsChecker = TwoFALimitsChecker;
//# sourceMappingURL=new-limits-checker.js.map