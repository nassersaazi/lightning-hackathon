"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalFeeCalculator = void 0;
const bitcoin_1 = require("../bitcoin");
const WithdrawalFeeCalculator = ({ thresholdImbalance, feeRatio, }) => {
    const onChainWithdrawalFee = ({ minerFee, amount, minBankFee, imbalance, }) => {
        const baseAmount = Math.max(Math.min(imbalance - thresholdImbalance + amount, amount), 0);
        const bankFee = (0, bitcoin_1.toSats)(Math.max(minBankFee, Math.ceil(baseAmount * feeRatio)));
        return {
            totalFee: (0, bitcoin_1.toSats)(bankFee + minerFee),
            bankFee,
        };
    };
    return {
        onChainWithdrawalFee,
        onChainIntraLedgerFee: () => (0, bitcoin_1.toSats)(0),
    };
};
exports.WithdrawalFeeCalculator = WithdrawalFeeCalculator;
//# sourceMappingURL=withdrawal-fee-calculator.js.map