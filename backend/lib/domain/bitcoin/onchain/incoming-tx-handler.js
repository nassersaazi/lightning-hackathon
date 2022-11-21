"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomingOnChainTxHandler = void 0;
const shared_1 = require("../../shared");
const calc = (0, shared_1.AmountCalculator)();
const IncomingOnChainTxHandler = (txns) => {
    const balancesByAddresses = () => {
        const pendingBalances = txns.map(balanceFromIncomingTx);
        const balancesByAddress = {};
        for (const balances of pendingBalances) {
            if (balances instanceof Error)
                return balances;
            for (const key of Object.keys(balances)) {
                const address = key;
                balancesByAddress[address] = calc.add(balancesByAddress[address] || shared_1.ZERO_SATS, balances[address]);
            }
        }
        return balancesByAddress;
    };
    const balanceByWallet = (wallets) => {
        const balancesByAddress = balancesByAddresses();
        if (balancesByAddress instanceof Error)
            return balancesByAddress;
        const balancesByWallet = {};
        for (const wallet of wallets) {
            balancesByWallet[wallet.id] = shared_1.ZERO_SATS;
            for (const key of Object.keys(balancesByAddress)) {
                const address = key;
                if (wallet.onChainAddresses().includes(address)) {
                    balancesByWallet[wallet.id] = calc.add(balancesByWallet[wallet.id], balancesByAddress[address]);
                }
            }
        }
        return balancesByWallet;
    };
    const balanceFromIncomingTx = (tx) => {
        const balanceByAddress = {};
        const { rawTx: { outs }, } = tx;
        for (const out of outs) {
            if (!out.address)
                continue;
            const outAmount = (0, shared_1.paymentAmountFromNumber)({
                amount: out.sats,
                currency: shared_1.WalletCurrency.Btc,
            });
            if (outAmount instanceof Error)
                return outAmount;
            balanceByAddress[out.address] = calc.add(balanceByAddress[out.address] || shared_1.ZERO_SATS, outAmount);
        }
        return balanceByAddress;
    };
    return {
        balancesByAddresses,
        balanceByWallet,
    };
};
exports.IncomingOnChainTxHandler = IncomingOnChainTxHandler;
//# sourceMappingURL=incoming-tx-handler.js.map