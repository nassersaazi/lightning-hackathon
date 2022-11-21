"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnChainAddress = void 0;
const _config_1 = require("../../config/index");
const onchain_1 = require("../../domain/bitcoin/onchain");
const rate_limit_1 = require("../../domain/rate-limit");
const onchain_service_1 = require("../../services/lnd/onchain-service");
const mongoose_1 = require("../../services/mongoose");
const rate_limit_2 = require("../../services/rate-limit");
const createOnChainAddress = async (walletId) => {
    const wallet = await (0, mongoose_1.WalletsRepository)().findById(walletId);
    if (wallet instanceof Error)
        return wallet;
    const limitOk = await checkOnChainAddressAccountIdLimits(wallet.accountId);
    if (limitOk instanceof Error)
        return limitOk;
    const onChainService = (0, onchain_service_1.OnChainService)((0, onchain_1.TxDecoder)(_config_1.BTC_NETWORK));
    if (onChainService instanceof Error)
        return onChainService;
    const onChainAddress = await onChainService.createOnChainAddress();
    if (onChainAddress instanceof Error)
        return onChainAddress;
    const onChainAddressesRepo = (0, mongoose_1.WalletOnChainAddressesRepository)();
    const savedOnChainAddress = await onChainAddressesRepo.persistNew({
        walletId,
        onChainAddress,
    });
    if (savedOnChainAddress instanceof Error)
        return savedOnChainAddress;
    return savedOnChainAddress.address;
};
exports.createOnChainAddress = createOnChainAddress;
const checkOnChainAddressAccountIdLimits = async (accountId) => (0, rate_limit_2.consumeLimiter)({
    rateLimitConfig: rate_limit_1.RateLimitConfig.onChainAddressCreate,
    keyToConsume: accountId,
});
//# sourceMappingURL=create-on-chain-address.js.map