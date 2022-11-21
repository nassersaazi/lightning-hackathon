"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBusinessMapInfo = void 0;
const accounts_1 = require("../../domain/accounts");
const accounts_2 = require("../../services/mongoose/accounts");
const updateBusinessMapInfo = async ({ username, coordinates: { latitude, longitude }, title, }) => {
    const accountsRepo = (0, accounts_2.AccountsRepository)();
    const usernameChecked = (0, accounts_1.checkedToUsername)(username);
    if (usernameChecked instanceof Error)
        return usernameChecked;
    const account = await accountsRepo.findByUsername(usernameChecked);
    if (account instanceof Error)
        return account;
    const coordinates = (0, accounts_1.checkedCoordinates)({ latitude, longitude });
    if (coordinates instanceof Error)
        return coordinates;
    const titleChecked = (0, accounts_1.checkedMapTitle)(title);
    if (titleChecked instanceof Error)
        return titleChecked;
    account.coordinates = coordinates;
    account.title = titleChecked;
    return accountsRepo.update(account);
};
exports.updateBusinessMapInfo = updateBusinessMapInfo;
//# sourceMappingURL=update-business-map-info.js.map