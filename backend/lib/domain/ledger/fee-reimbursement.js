"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeReimbursement = void 0;
const shared_1 = require("../shared");
const errors_1 = require("./errors");
const FeeReimbursement = ({ prepaidFeeAmount, priceRatio, }) => {
    const getReimbursement = (actualFee) => {
        const feeDifferenceBtc = prepaidFeeAmount.btc.amount - actualFee.amount;
        if (feeDifferenceBtc < 0)
            return new errors_1.FeeDifferenceError();
        const feeDifferenceBtcAmount = {
            amount: feeDifferenceBtc,
            currency: shared_1.WalletCurrency.Btc,
        };
        const feeDifferenceUsdAmount = actualFee.amount === 0n
            ? priceRatio.convertFromBtc(feeDifferenceBtcAmount)
            : priceRatio.convertFromBtcToFloor(feeDifferenceBtcAmount);
        return { btc: feeDifferenceBtcAmount, usd: feeDifferenceUsdAmount };
    };
    return {
        getReimbursement,
    };
};
exports.FeeReimbursement = FeeReimbursement;
//# sourceMappingURL=fee-reimbursement.js.map