"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersIpRepository = void 0;
const schema_1 = require("./schema");
const errors_1 = require("../../domain/errors");
const utils_1 = require("./utils");
const UsersIpRepository = () => {
    const update = async (userIp) => {
        try {
            const result = await schema_1.User.updateOne({ _id: (0, utils_1.toObjectId)(userIp.id) }, { $set: { lastConnection: new Date(), lastIPs: userIp.lastIPs } });
            if (result.matchedCount === 0) {
                return new errors_1.CouldNotFindError("Couldn't find user");
            }
            if (result.modifiedCount !== 1) {
                return new errors_1.PersistError("Couldn't update ip for user");
            }
            return true;
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findById = async (userId) => {
        try {
            const result = await schema_1.User.findOne({ _id: (0, utils_1.toObjectId)(userId) }, { lastIPs: 1 });
            if (!result) {
                return new errors_1.CouldNotFindUserFromIdError(userId);
            }
            return userIPsFromRaw(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    return {
        update,
        findById,
    };
};
exports.UsersIpRepository = UsersIpRepository;
const userIPsFromRaw = (result) => {
    return {
        id: (0, utils_1.fromObjectId)(result._id),
        lastIPs: (result.lastIPs || []),
    };
};
//# sourceMappingURL=users-ips.js.map