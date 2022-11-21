"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitsChecker = void 0;
const errors_1 = require("../errors");
const tracing_1 = require("../../services/tracing");
const LimitsChecker = ({ accountLimits, }) => {
    const checkIntraledger = ({ amount, walletVolume, }) => {
        const limit = accountLimits.intraLedgerLimit;
        const volume = walletVolume.outgoingBaseAmount;
        (0, tracing_1.addAttributesToCurrentSpan)({
            "txVolume.outgoingInBase": `${volume}`,
            "txVolume.threshold": `${limit}`,
            "txVolume.amountInBase": `${amount}`,
            "txVolume.limitCheck": "checkIntraledger",
        });
        const remainingLimit = limit - volume;
        if (remainingLimit < amount) {
            return new errors_1.IntraledgerLimitsExceededError(`Cannot transfer more than ${accountLimits.intraLedgerLimit} cents in 24 hours`);
        }
        return true;
    };
    const checkWithdrawal = ({ amount, walletVolume, }) => {
        const limit = accountLimits.withdrawalLimit;
        const volume = walletVolume.outgoingBaseAmount;
        (0, tracing_1.addAttributesToCurrentSpan)({
            "txVolume.outgoingInBase": `${volume}`,
            "txVolume.threshold": `${limit}`,
            "txVolume.amountInBase": `${amount}`,
            "txVolume.limitCheck": "checkWithdrawal",
        });
        const remainingLimit = limit - volume;
        if (remainingLimit < amount) {
            return new errors_1.WithdrawalLimitsExceededError(`Cannot transfer more than ${accountLimits.withdrawalLimit} cents in 24 hours`);
        }
        return true;
    };
    return {
        checkIntraledger,
        checkWithdrawal,
    };
};
exports.LimitsChecker = LimitsChecker;
//# sourceMappingURL=limits-checker.js.map