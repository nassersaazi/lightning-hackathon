"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositFeeCalculator = void 0;
const bitcoin_1 = require("../bitcoin");
const DepositFeeCalculator = () => {
    const onChainDepositFee = ({ amount, ratio }) => {
        return (0, bitcoin_1.toSats)(Math.round(amount * ratio));
    };
    return {
        onChainDepositFee,
        lnDepositFee: () => (0, bitcoin_1.toSats)(0), // TODO: implement
    };
};
exports.DepositFeeCalculator = DepositFeeCalculator;
//# sourceMappingURL=deposit-fee-calculator.js.map