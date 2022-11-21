"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountValidator = void 0;
const errors_1 = require("../errors");
const primitives_1 = require("./primitives");
const AccountValidator = (account) => {
    if (account.status !== primitives_1.AccountStatus.Active) {
        return new errors_1.InactiveAccountError(account.id);
    }
    const validateWalletForAccount = (wallet) => {
        if (wallet.accountId !== account.id)
            return new errors_1.InvalidWalletId(JSON.stringify({ accountId: account.id, accountIdFromWallet: wallet.accountId }));
        return true;
    };
    return { validateWalletForAccount };
};
exports.AccountValidator = AccountValidator;
//# sourceMappingURL=account-validator.js.map