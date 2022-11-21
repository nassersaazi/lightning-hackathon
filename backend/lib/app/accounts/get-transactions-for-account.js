"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsForAccountByWalletIds = void 0;
const accounts_1 = require("../../domain/accounts");
const errors_1 = require("../../domain/errors");
const mongoose_1 = require("../../services/mongoose");
const wallets_1 = require("../wallets");
const partial_result_1 = require("../partial-result");
const getTransactionsForAccountByWalletIds = async ({ account, walletIds, }) => {
    const walletsRepo = (0, mongoose_1.WalletsRepository)();
    const wallets = [];
    for (const walletId of walletIds) {
        const wallet = await walletsRepo.findById(walletId);
        if (wallet instanceof errors_1.RepositoryError)
            return partial_result_1.PartialResult.err(wallet);
        const accountValidator = (0, accounts_1.AccountValidator)(account);
        if (accountValidator instanceof Error)
            return partial_result_1.PartialResult.err(accountValidator);
        const validateWallet = accountValidator.validateWalletForAccount(wallet);
        if (validateWallet instanceof Error)
            return partial_result_1.PartialResult.err(validateWallet);
        wallets.push(wallet);
    }
    return (0, wallets_1.getTransactionsForWallets)(wallets);
};
exports.getTransactionsForAccountByWalletIds = getTransactionsForAccountByWalletIds;
//# sourceMappingURL=get-transactions-for-account.js.map