"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContactByUsername = void 0;
const errors_1 = require("../../domain/errors");
const getContactByUsername = async ({ account, contactUsername, }) => {
    const contact = account.contacts.find((contact) => contact.username.toLocaleLowerCase() === contactUsername);
    if (!contact) {
        return new errors_1.NoContactForUsernameError();
    }
    return contact;
};
exports.getContactByUsername = getContactByUsername;
//# sourceMappingURL=get-contact-by-username.js.map