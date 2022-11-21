"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsRepository = void 0;
const _config_1 = require("../../config/index");
const accounts_1 = require("../../domain/accounts");
const bitcoin_1 = require("../../domain/bitcoin");
const errors_1 = require("../../domain/errors");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
const caseInsensitiveRegex = (input) => {
    return new RegExp(`^${input}$`, "i");
};
const AccountsRepository = () => {
    const listUnlockedAccounts = async () => {
        try {
            const result /* UserRecord actually not correct with {projection} */ = await schema_1.User.find({ $expr: { $eq: [{ $last: "$statusHistory.status" }, accounts_1.AccountStatus.Active] } }, projection);
            if (result.length === 0)
                return new errors_1.CouldNotFindError();
            return result.map((a) => translateToAccount(a));
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findById = async (accountId) => {
        try {
            const result /* UserRecord actually not correct with {projection} */ = await schema_1.User.findOne({ _id: (0, utils_1.toObjectId)(accountId) }, projection);
            if (!result)
                return new errors_1.CouldNotFindError();
            return translateToAccount(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findByUsername = async (username) => {
        try {
            const result = await schema_1.User.findOne({ username: caseInsensitiveRegex(username) }, projection);
            if (!result) {
                return new errors_1.CouldNotFindAccountFromUsernameError(username);
            }
            return translateToAccount(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findByUserId = async (userId) => {
        return findById(userId);
    };
    // FIXME: could be in a different file? does not return an Account
    const listBusinessesForMap = async () => {
        try {
            const accounts = await schema_1.User.find({
                title: { $exists: true, $ne: undefined },
                coordinates: { $exists: true, $ne: undefined },
            }, { username: 1, title: 1, coordinates: 1 });
            if (!accounts) {
                return new errors_1.CouldNotFindError();
            }
            return accounts.map((account) => ({
                username: account.username,
                mapInfo: {
                    title: account.title,
                    coordinates: account.coordinates,
                },
            }));
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    // currently only used by Admin
    const update = async ({ id, level, statusHistory, coordinates, contactEnabled, contacts, title, username, defaultWalletId, withdrawFee, role, kratosUserId, }) => {
        try {
            const result = await schema_1.User.findOneAndUpdate({ _id: (0, utils_1.toObjectId)(id) }, {
                level,
                statusHistory,
                coordinates,
                title,
                username,
                contactEnabled,
                contacts: contacts.map(({ username, alias, transactionsCount }) => ({
                    id: username,
                    name: alias,
                    transactionsCount,
                })),
                defaultWalletId,
                withdrawFee,
                role,
                kratosUserId,
            }, {
                new: true,
                projection,
            });
            if (!result) {
                return new errors_1.RepositoryError("Couldn't update account");
            }
            return translateToAccount(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const persistNew = async ({ kratosUserId, phone, phoneMetadata, }) => {
        try {
            const user = new schema_1.User();
            user.kratosUserId = kratosUserId;
            if (phone) {
                user.phone = phone;
            }
            user.twilio = phoneMetadata;
            await user.save();
            return translateToAccount(user);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findByKratosUserId = async (kratosUserId) => {
        try {
            const result = await schema_1.User.findOne({ kratosUserId }, projection);
            if (!result) {
                return new errors_1.CouldNotFindAccountFromKratosIdError(kratosUserId);
            }
            return translateToAccount(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    return {
        persistNew,
        findByKratosUserId,
        listUnlockedAccounts,
        findById,
        findByUserId,
        findByUsername,
        listBusinessesForMap,
        update,
    };
};
exports.AccountsRepository = AccountsRepository;
const translateToAccount = (result) => ({
    id: (0, utils_1.fromObjectId)(result._id),
    createdAt: new Date(result.created_at),
    defaultWalletId: result.defaultWalletId,
    username: result.username,
    level: result.level || accounts_1.AccountLevel.One,
    status: result.statusHistory.slice(-1)[0].status,
    statusHistory: (result.statusHistory || []),
    title: result.title,
    coordinates: result.coordinates,
    ownerId: (0, utils_1.fromObjectId)(result._id),
    contactEnabled: !!result.contactEnabled,
    contacts: result.contacts.reduce((res, contact) => {
        if (contact.id) {
            res.push({
                id: contact.id,
                username: contact.id,
                alias: (contact.name || contact.id),
                transactionsCount: contact.transactionsCount,
            });
        }
        return res;
    }, []),
    depositFeeRatio: result.depositFeeRatio,
    withdrawFee: result.withdrawFee,
    isEditor: result.role === "editor",
    quizQuestions: result.earn?.map((questionId) => ({
        question: {
            id: questionId,
            earnAmount: (0, bitcoin_1.toSats)(_config_1.onboardingEarn[questionId]),
        },
        completed: true,
    })) || [],
    kratosUserId: result.kratosUserId,
});
const projection = {
    level: 1,
    statusHistory: 1,
    coordinates: 1,
    defaultWalletId: 1,
    username: 1,
    title: 1,
    created_at: 1,
    contactEnabled: 1,
    contacts: 1,
    depositFeeRatio: 1,
    withdrawFee: 1,
    role: 1,
    earn: 1,
    kratosUserId: 1,
};
//# sourceMappingURL=accounts.js.map