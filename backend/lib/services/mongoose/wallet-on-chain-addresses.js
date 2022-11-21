"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletOnChainAddressesRepository = void 0;
const errors_1 = require("../../domain/errors");
const logger_1 = require("../logger");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
const WalletOnChainAddressesRepository = () => {
    const persistNew = async ({ walletId, onChainAddress, }) => {
        try {
            const { address, pubkey } = onChainAddress;
            const result = await schema_1.Wallet.updateOne({ id: walletId }, { $push: { onchain: { address, pubkey } } });
            if (result.matchedCount === 0) {
                return new errors_1.CouldNotFindError("Couldn't find wallet");
            }
            if (result.modifiedCount !== 1) {
                return new errors_1.PersistError("Couldn't add onchain address for wallet");
            }
            return onChainAddress;
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findLastByWalletId = async (id) => {
        try {
            const [result] = await schema_1.Wallet.aggregate([
                { $match: { id } },
                { $project: { lastAddress: { $last: "$onchain" } } },
            ]);
            if (!result || !result.lastAddress) {
                return new errors_1.CouldNotFindError("Couldn't find address for wallet");
            }
            return {
                pubkey: result.lastAddress.pubkey,
                address: result.lastAddress.address,
            };
        }
        catch (err) {
            logger_1.baseLogger.warn({ err }, "issue findLastByWalletId");
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    return {
        persistNew,
        findLastByWalletId,
    };
};
exports.WalletOnChainAddressesRepository = WalletOnChainAddressesRepository;
//# sourceMappingURL=wallet-on-chain-addresses.js.map