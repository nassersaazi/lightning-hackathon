"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LnFees = void 0;
const bitcoin_1 = require("../bitcoin");
const shared_1 = require("../shared");
const calc = (0, shared_1.AmountCalculator)();
const LnFees = ({ feeCapBasisPoints, } = {
    feeCapBasisPoints: bitcoin_1.FEECAP_BASIS_POINTS,
}) => {
    const maxProtocolFee = (amount) => {
        if (amount.amount == 0n) {
            return amount;
        }
        const maxFee = calc.mulBasisPoints(amount, feeCapBasisPoints);
        return {
            amount: maxFee.amount === 0n ? 1n : maxFee.amount,
            currency: amount.currency,
        };
    };
    const intraLedgerFees = () => {
        return {
            btc: shared_1.ZERO_SATS,
            usd: shared_1.ZERO_CENTS,
        };
    };
    const feeFromRawRoute = (rawRoute) => {
        const amount = Math.ceil(rawRoute.fee);
        return (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Btc });
    };
    return {
        intraLedgerFees,
        maxProtocolFee,
        feeFromRawRoute,
    };
};
exports.LnFees = LnFees;
//# sourceMappingURL=ln-fees.js.map