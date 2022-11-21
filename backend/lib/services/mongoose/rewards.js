"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsRepository = void 0;
const errors_1 = require("../../domain/errors");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
// FIXME: improve boundary
const RewardsRepository = (accountId) => {
    const add = async (quizQuestionId) => {
        try {
            // by default, mongodb return the previous state before the update
            const oldState = await schema_1.User.findOneAndUpdate({ _id: (0, utils_1.toObjectId)(accountId) }, { $push: { earn: quizQuestionId } });
            if (!oldState) {
                return new errors_1.UnknownRepositoryError("account not found");
            }
            const rewardNotFound = oldState.earn.findIndex((item) => item === quizQuestionId) === -1;
            return rewardNotFound || new errors_1.RewardAlreadyPresentError();
        }
        catch (err) {
            return new errors_1.UnknownRepositoryError("reward issue");
        }
    };
    return {
        add,
    };
};
exports.RewardsRepository = RewardsRepository;
//# sourceMappingURL=rewards.js.map