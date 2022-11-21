"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLanguage = void 0;
const users_1 = require("../../domain/users");
const mongoose_1 = require("../../services/mongoose");
const updateLanguage = async ({ userId, language, }) => {
    const checkedLanguage = (0, users_1.checkedToLanguage)(language);
    if (checkedLanguage instanceof Error)
        return checkedLanguage;
    const usersRepo = (0, mongoose_1.UsersRepository)();
    const user = await usersRepo.findById(userId);
    if (user instanceof Error)
        return user;
    user.language = checkedLanguage;
    return usersRepo.update(user);
};
exports.updateLanguage = updateLanguage;
//# sourceMappingURL=update-language.js.map