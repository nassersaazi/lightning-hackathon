"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewContact = void 0;
const mongoose_1 = require("../../services/mongoose");
const addNewContact = async ({ accountId, contactUsername, }) => {
    const accountsRepo = (0, mongoose_1.AccountsRepository)();
    const contactAccount = await accountsRepo.findByUsername(contactUsername);
    if (contactAccount instanceof Error)
        return contactAccount;
    const account = await accountsRepo.findById(accountId);
    if (account instanceof Error)
        return account;
    const idx = account.contacts.findIndex((userContact) => userContact.username === contactUsername);
    if (idx >= 0) {
        account.contacts[idx].transactionsCount++;
    }
    else {
        account.contacts.push({
            id: contactUsername,
            username: contactUsername,
            alias: "",
            transactionsCount: 1,
        });
    }
    const updateResult = await accountsRepo.update(account);
    if (updateResult instanceof Error)
        return updateResult;
    return account;
};
exports.addNewContact = addNewContact;
//# sourceMappingURL=add-new-contact.js.map