"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmountCalculator = void 0;
const AmountCalculator = () => {
    const add = (a, b) => {
        return {
            currency: a.currency,
            amount: a.amount + b.amount,
        };
    };
    const sub = (a, b) => {
        return {
            currency: a.currency,
            amount: a.amount - b.amount,
        };
    };
    const divRound = (a, b) => {
        const quotient = a.amount / b;
        const roundDownBound = b / 2n;
        const mod = a.amount % b;
        return mod > roundDownBound
            ? { amount: quotient + 1n, currency: a.currency }
            : { amount: quotient, currency: a.currency };
    };
    const divFloor = (a, b) => {
        const quotient = a.amount / b;
        return { amount: quotient, currency: a.currency };
    };
    const divCeil = (a, b) => {
        const quotient = a.amount / b;
        const mod = a.amount % b;
        return mod > 0n
            ? { amount: quotient + 1n, currency: a.currency }
            : { amount: quotient, currency: a.currency };
    };
    const mulBasisPoints = (amount, basisPoints) => divRound({ amount: amount.amount * basisPoints, currency: amount.currency }, 10000n);
    return {
        sub,
        add,
        divRound,
        divFloor,
        divCeil,
        mulBasisPoints,
    };
};
exports.AmountCalculator = AmountCalculator;
//# sourceMappingURL=calculator.js.map