"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebalanceToHotWallet = void 0;
const _config_1 = require("../../config/index");
const bitcoin_1 = require("../../domain/bitcoin");
const onchain_1 = require("../../domain/bitcoin/onchain");
const cold_storage_1 = require("../../services/cold-storage");
const onchain_service_1 = require("../../services/lnd/onchain-service");
const rebalanceToHotWallet = async ({ walletName, amount, targetConfirmations, }) => {
    const checkedAmount = (0, bitcoin_1.checkedToSats)(amount);
    if (checkedAmount instanceof Error)
        return checkedAmount;
    const targetConfs = (0, bitcoin_1.checkedToTargetConfs)(targetConfirmations);
    if (targetConfs instanceof Error)
        return targetConfs;
    const coldStorageService = await (0, cold_storage_1.ColdStorageService)();
    if (coldStorageService instanceof Error)
        return coldStorageService;
    const onChainService = (0, onchain_service_1.OnChainService)((0, onchain_1.TxDecoder)(_config_1.BTC_NETWORK));
    if (onChainService instanceof Error)
        return onChainService;
    const onChainAddress = await onChainService.createOnChainAddress();
    if (onChainAddress instanceof Error)
        return onChainAddress;
    return coldStorageService.createPsbt({
        walletName,
        amount: checkedAmount,
        onChainAddress: onChainAddress.address,
        targetConfirmations: targetConfs,
    });
};
exports.rebalanceToHotWallet = rebalanceToHotWallet;
//# sourceMappingURL=rebalance-to-hot-wallet.js.map