"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwapDestAddress = void 0;
const onchain_service_1 = require("../../services/lnd/onchain-service");
const _config_1 = require("../../config/index");
const onchain_1 = require("../../domain/bitcoin/onchain");
// logic to choose the correct onChain address for the swap out destination
// active lnd node that has ["onChain"] wallet
const getSwapDestAddress = async () => {
    const onChainService = (0, onchain_service_1.OnChainService)((0, onchain_1.TxDecoder)(_config_1.BTC_NETWORK));
    if (onChainService instanceof Error)
        return onChainService;
    const onChainAddress = await onChainService.createOnChainAddress();
    if (onChainAddress instanceof Error)
        return onChainAddress;
    return onChainAddress.address;
};
exports.getSwapDestAddress = getSwapDestAddress;
//# sourceMappingURL=get-swap-dest-address.js.map