"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountByUserPhone = exports.getAccountByUsername = void 0;
const accounts_1 = require("../../domain/accounts");
const mongoose_1 = require("../../services/mongoose");
const getAccountByUsername = async (username) => {
    const usernameValid = (0, accounts_1.checkedToUsername)(username);
    if (usernameValid instanceof Error)
        return usernameValid;
    const accounts = (0, mongoose_1.AccountsRepository)();
    return accounts.findByUsername(usernameValid);
};
exports.getAccountByUsername = getAccountByUsername;
const getAccountByUserPhone = async (phone) => {
    const users = (0, mongoose_1.UsersRepository)();
    const user = await users.findByPhone(phone);
    if (user instanceof Error)
        return user;
    const accounts = (0, mongoose_1.AccountsRepository)();
    return accounts.findById(user.defaultAccountId);
};
exports.getAccountByUserPhone = getAccountByUserPhone;
//# sourceMappingURL=index.js.map