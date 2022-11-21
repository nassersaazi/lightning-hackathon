"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsRepository = void 0;
const errors_1 = require("../../domain/errors");
const utils_1 = require("./utils");
const schema_1 = require("./schema");
const accounts_1 = require("./accounts");
const WalletsRepository = () => {
    const persistNew = async ({ accountId, type, currency, }) => {
        const account = await (0, accounts_1.AccountsRepository)().findById(accountId);
        // verify that the account exist
        if (account instanceof Error)
            return account;
        try {
            const wallet = new schema_1.Wallet({
                _accountId: (0, utils_1.toObjectId)(accountId),
                type,
                currency,
            });
            await wallet.save();
            return resultToWallet(wallet);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findById = async (walletId) => {
        try {
            const result = await schema_1.Wallet.findOne({ id: walletId });
            if (!result) {
                return new errors_1.CouldNotFindWalletFromIdError();
            }
            return resultToWallet(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const listByAccountId = async (accountId) => {
        try {
            const result = await schema_1.Wallet.find({
                _accountId: (0, utils_1.toObjectId)(accountId),
            });
            if (!result || result.length === 0) {
                return new errors_1.CouldNotListWalletsFromAccountIdError();
            }
            return result.map(resultToWallet);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findByAddress = async (address) => {
        try {
            const result = await schema_1.Wallet.findOne({
                "onchain.address": address,
            });
            if (!result) {
                return new errors_1.CouldNotFindWalletFromOnChainAddressError();
            }
            return resultToWallet(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const listByAddresses = async (addresses) => {
        try {
            const result = await schema_1.Wallet.find({
                "onchain.address": { $in: addresses },
            });
            if (!result || result.length === 0) {
                return new errors_1.CouldNotFindWalletFromOnChainAddressesError();
            }
            return result.map(resultToWallet);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    // TODO: future performance improvement might be needed
    // add pagination for instance which would have millions of wallets
    const listByWalletCurrency = async (walletCurrency) => {
        try {
            const result = await schema_1.Wallet.find({ currency: walletCurrency });
            if (!result) {
                return new errors_1.CouldNotListWalletsFromWalletCurrencyError();
            }
            return result.map(resultToWallet);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    return {
        findById,
        listByAccountId,
        findByAddress,
        listByAddresses,
        persistNew,
        listByWalletCurrency,
    };
};
exports.WalletsRepository = WalletsRepository;
const resultToWallet = (result) => {
    const id = result.id;
    const accountId = (0, utils_1.fromObjectId)(result._accountId);
    const type = result.type;
    const currency = result.currency;
    const onChain = result.onchain || [];
    const onChainAddressIdentifiers = onChain.map(({ pubkey, address }) => {
        return {
            pubkey: pubkey,
            address: address,
        };
    });
    const onChainAddresses = () => onChainAddressIdentifiers.map(({ address }) => address);
    return {
        id,
        accountId,
        type,
        onChainAddressIdentifiers,
        onChainAddresses,
        currency,
    };
};
//# sourceMappingURL=wallets.js.map