"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const errors_1 = require("../../domain/errors");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
const UsersRepository = () => {
    const findById = async (userId) => {
        try {
            const result = await schema_1.User.findOne({ _id: (0, utils_1.toObjectId)(userId) }, projection);
            if (!result) {
                return new errors_1.CouldNotFindUserFromIdError(userId);
            }
            return userFromRaw(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findByPhone = async (phone) => {
        try {
            const result = await schema_1.User.findOne({ phone }, projection);
            if (!result) {
                return new errors_1.CouldNotFindUserFromPhoneError(phone);
            }
            return userFromRaw(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const update = async ({ id, phone, language, deviceTokens, }) => {
        try {
            const data = {
                phone,
                language,
                deviceToken: deviceTokens,
            };
            const result = await schema_1.User.findOneAndUpdate({ _id: (0, utils_1.toObjectId)(id) }, data, {
                projection,
                new: true,
            });
            if (!result) {
                return new errors_1.RepositoryError("Couldn't update user");
            }
            return userFromRaw(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    return {
        findById,
        findByPhone,
        update,
    };
};
exports.UsersRepository = UsersRepository;
const userFromRaw = (result) => ({
    id: (0, utils_1.fromObjectId)(result._id),
    phone: result.phone,
    language: result.language,
    defaultAccountId: (0, utils_1.fromObjectId)(result._id),
    deviceTokens: (result.deviceToken || []),
    createdAt: new Date(result.created_at),
    phoneMetadata: result.twilio,
});
const projection = {
    phone: 1,
    language: 1,
    twoFA: 1,
    deviceToken: 1,
    created_at: 1,
    twilio: 1,
};
//# sourceMappingURL=users.js.map