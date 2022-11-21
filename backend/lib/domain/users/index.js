"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Languages = exports.checkedToAccountLevel = exports.checkedToLanguage = exports.checkedToEmailAddress = exports.checkedToPhoneNumber = void 0;
const accounts_1 = require("../accounts");
const errors_1 = require("../errors");
const languages_1 = require("./languages");
Object.defineProperty(exports, "Languages", { enumerable: true, get: function () { return languages_1.Languages; } });
// TODO: we could be using https://gitlab.com/catamphetamine/libphonenumber-js#readme
// for a more precise "regex"
const PhoneNumberRegex = /^\+\d{7,14}$/i; // FIXME {7,14} to be refined
const EmailAddressRegex = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,4}$/i;
const checkedToPhoneNumber = (phoneNumber) => {
    if (!phoneNumber.match(PhoneNumberRegex)) {
        return new errors_1.InvalidPhoneNumber(phoneNumber);
    }
    return phoneNumber;
};
exports.checkedToPhoneNumber = checkedToPhoneNumber;
const checkedToEmailAddress = (emailAddress) => {
    if (!emailAddress.match(EmailAddressRegex)) {
        return new errors_1.InvalidEmailAddress(emailAddress);
    }
    return emailAddress;
};
exports.checkedToEmailAddress = checkedToEmailAddress;
const checkedToLanguage = (language) => {
    if (language === "DEFAULT" || language === "")
        return "";
    if (languages_1.Languages.includes(language))
        return language;
    return new errors_1.InvalidLanguageError();
};
exports.checkedToLanguage = checkedToLanguage;
const checkedToAccountLevel = (level) => {
    if (Object.values(accounts_1.AccountLevel).includes(level))
        return level;
    return new errors_1.InvalidAccountLevelError();
};
exports.checkedToAccountLevel = checkedToAccountLevel;
//# sourceMappingURL=index.js.map