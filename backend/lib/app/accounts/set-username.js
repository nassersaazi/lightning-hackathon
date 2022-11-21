"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUsername = void 0;
const accounts_1 = require("./");
const accounts_2 = require("../../domain/accounts");
const mongoose_1 = require("../../services/mongoose");
const setUsername = async ({ id, username, }) => {
    const checkedUsername = (0, accounts_2.checkedToUsername)(username);
    if (checkedUsername instanceof Error)
        return checkedUsername;
    const accountsRepo = (0, mongoose_1.AccountsRepository)();
    const account = await accountsRepo.findById(id);
    if (account instanceof Error)
        return account;
    if (account.username)
        return new accounts_2.UsernameIsImmutableError();
    const isAvailable = await (0, accounts_1.usernameAvailable)(checkedUsername);
    if (isAvailable instanceof Error)
        return isAvailable;
    if (!isAvailable)
        return new accounts_2.UsernameNotAvailableError();
    account.username = checkedUsername;
    return accountsRepo.update(account);
};
exports.setUsername = setUsername;
//# sourceMappingURL=set-username.js.map