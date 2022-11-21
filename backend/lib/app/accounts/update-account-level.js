"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountLevel = void 0;
const mongoose_1 = require("../../services/mongoose");
const updateAccountLevel = async ({ id, level, }) => {
    const accountsRepo = (0, mongoose_1.AccountsRepository)();
    const account = await accountsRepo.findById(id);
    if (account instanceof Error)
        return account;
    account.level = level;
    return accountsRepo.update(account);
};
exports.updateAccountLevel = updateAccountLevel;
//# sourceMappingURL=update-account-level.js.map