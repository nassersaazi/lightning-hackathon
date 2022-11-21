"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountStatus = void 0;
const accounts_1 = require("../../domain/accounts");
const mongoose_1 = require("../../services/mongoose");
const updateAccountStatus = async ({ id, status, updatedByUserId, comment, }) => {
    const accountsRepo = (0, mongoose_1.AccountsRepository)();
    const account = await accountsRepo.findById(id);
    if (account instanceof Error)
        return account;
    const statusChecked = (0, accounts_1.checkedAccountStatus)(status);
    if (statusChecked instanceof Error)
        return statusChecked;
    account.statusHistory = (account.statusHistory ?? []).concat({
        status: statusChecked,
        updatedByUserId,
        comment,
    });
    return accountsRepo.update(account);
};
exports.updateAccountStatus = updateAccountStatus;
//# sourceMappingURL=update-account-status.js.map