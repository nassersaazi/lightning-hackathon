"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingOnChainBalanceForWallets = void 0;
const _config_1 = require("../../config/index");
const onchain_1 = require("../../domain/bitcoin/onchain");
const logger_1 = require("../../services/logger");
const incoming_tx_handler_1 = require("../../domain/bitcoin/onchain/incoming-tx-handler");
const get_on_chain_txs_1 = require("./private/get-on-chain-txs");
const getPendingOnChainBalanceForWallets = async (wallets) => {
    const onChainTxs = await (0, get_on_chain_txs_1.getOnChainTxs)();
    if (onChainTxs instanceof Error) {
        logger_1.baseLogger.warn({ onChainTxs }, "impossible to get listIncomingTransactions");
        return onChainTxs;
    }
    const filter = (0, onchain_1.TxFilter)({
        confirmationsLessThan: _config_1.ONCHAIN_MIN_CONFIRMATIONS,
        addresses: wallets.flatMap((wallet) => wallet.onChainAddresses()),
    });
    const pendingIncoming = filter.apply(onChainTxs);
    return (0, incoming_tx_handler_1.IncomingOnChainTxHandler)(pendingIncoming).balanceByWallet(wallets);
};
exports.getPendingOnChainBalanceForWallets = getPendingOnChainBalanceForWallets;
//# sourceMappingURL=get-pending-onchain-balance-for-wallet.js.map