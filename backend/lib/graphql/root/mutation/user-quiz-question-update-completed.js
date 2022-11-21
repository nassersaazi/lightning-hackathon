"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const error_map_1 = require("../../error-map");
const index_1 = require("../../index");
const user_quiz_question_update_completed_1 = __importDefault(require("../../types/payload/user-quiz-question-update-completed"));
const UserQuizQuestionUpdateCompletedInput = index_1.GT.Input({
    name: "UserQuizQuestionUpdateCompletedInput",
    fields: () => ({
        id: { type: index_1.GT.NonNull(index_1.GT.ID) },
    }),
});
const UserQuizQuestionUpdateCompletedMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(user_quiz_question_update_completed_1.default),
    args: {
        input: { type: index_1.GT.NonNull(UserQuizQuestionUpdateCompletedInput) },
    },
    resolve: async (_, args, { domainAccount }) => {
        const { id } = args.input;
        const question = await _app_1.Accounts.addEarn({
            quizQuestionId: id,
            accountId: domainAccount.id,
        });
        if (question instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(question)] };
        }
        return {
            errors: [],
            userQuizQuestion: {
                question,
                completed: true,
            },
        };
    },
});
exports.default = UserQuizQuestionUpdateCompletedMutation;
//# sourceMappingURL=user-quiz-question-update-completed.js.map