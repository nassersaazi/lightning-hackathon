"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalanceForWallet = void 0;
const ledger_1 = require("../../services/ledger");
const payments_1 = require("../payments");
const getBalanceForWallet = async ({ walletId, logger, }) => {
    const updatePaymentsResult = await (0, payments_1.updatePendingPaymentsByWalletId)({
        walletId,
        logger,
    });
    if (updatePaymentsResult instanceof Error)
        return updatePaymentsResult;
    return (0, ledger_1.LedgerService)().getWalletBalance(walletId);
};
exports.getBalanceForWallet = getBalanceForWallet;
//# sourceMappingURL=get-balance-for-wallet.js.map