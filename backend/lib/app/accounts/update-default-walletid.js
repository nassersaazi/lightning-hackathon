"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDefaultWalletId = void 0;
const errors_1 = require("../../domain/errors");
const mongoose_1 = require("../../services/mongoose");
const updateDefaultWalletId = async ({ accountId, walletId, }) => {
    const account = await (0, mongoose_1.AccountsRepository)().findById(accountId);
    if (account instanceof Error)
        return account;
    const wallets = await (0, mongoose_1.WalletsRepository)().listByAccountId(account.id);
    if (wallets instanceof Error)
        return wallets;
    if (!wallets.some((w) => w.id === walletId))
        return new errors_1.InvalidWalletId();
    account.defaultWalletId = walletId;
    return (0, mongoose_1.AccountsRepository)().update(account);
};
exports.updateDefaultWalletId = updateDefaultWalletId;
//# sourceMappingURL=update-default-walletid.js.map