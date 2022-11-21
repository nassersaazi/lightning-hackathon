"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactAlias = void 0;
const accounts_1 = require("../../domain/accounts");
const errors_1 = require("../../domain/errors");
const mongoose_1 = require("../../services/mongoose");
const updateContactAlias = async ({ accountId, username, alias, }) => {
    const repo = (0, mongoose_1.AccountsRepository)();
    const aliasChecked = (0, accounts_1.checkedToContactAlias)(alias);
    if (aliasChecked instanceof Error)
        return aliasChecked;
    const account = await repo.findById(accountId);
    if (account instanceof Error) {
        return account;
    }
    const contact = account.contacts.find((contact) => contact.username === username);
    if (!contact) {
        return new errors_1.ContactNotExistentError();
    }
    contact.alias = aliasChecked;
    const result = await repo.update(account);
    if (result instanceof Error) {
        return result;
    }
    return contact;
};
exports.updateContactAlias = updateContactAlias;
//# sourceMappingURL=update-contact-alias.js.map