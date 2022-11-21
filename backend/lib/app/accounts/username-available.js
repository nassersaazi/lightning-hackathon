"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usernameAvailable = void 0;
const accounts_1 = require("../../domain/accounts");
const errors_1 = require("../../domain/errors");
const mongoose_1 = require("../../services/mongoose");
const usernameAvailable = async (username) => {
    const checkedUsername = (0, accounts_1.checkedToUsername)(username);
    if (checkedUsername instanceof Error)
        return checkedUsername;
    const accountsRepo = (0, mongoose_1.AccountsRepository)();
    const account = await accountsRepo.findByUsername(checkedUsername);
    if (account instanceof errors_1.CouldNotFindError)
        return true;
    if (account instanceof Error)
        return account;
    return false;
};
exports.usernameAvailable = usernameAvailable;
//# sourceMappingURL=username-available.js.map