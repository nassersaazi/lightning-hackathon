"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastOnChainAddress = void 0;
const errors_1 = require("../../domain/errors");
const mongoose_1 = require("../../services/mongoose");
const create_on_chain_address_1 = require("./create-on-chain-address");
const getLastOnChainAddress = async (walletId) => {
    const onChainAddressesRepo = (0, mongoose_1.WalletOnChainAddressesRepository)();
    const lastOnChainAddress = await onChainAddressesRepo.findLastByWalletId(walletId);
    if (lastOnChainAddress instanceof errors_1.CouldNotFindError)
        return (0, create_on_chain_address_1.createOnChainAddress)(walletId);
    if (lastOnChainAddress instanceof Error)
        return lastOnChainAddress;
    return lastOnChainAddress.address;
};
exports.getLastOnChainAddress = getLastOnChainAddress;
//# sourceMappingURL=get-last-on-chain-address.js.map