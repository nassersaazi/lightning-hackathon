"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const error_1 = __importDefault(require("../abstract/error"));
const user_quiz_question_1 = __importDefault(require("../object/user-quiz-question"));
const UserQuizQuestionUpdateCompletedPayload = index_1.GT.Object({
    name: "UserQuizQuestionUpdateCompletedPayload",
    fields: () => ({
        errors: {
            type: index_1.GT.NonNullList(error_1.default),
        },
        userQuizQuestion: {
            type: user_quiz_question_1.default,
        },
    }),
});
exports.default = UserQuizQuestionUpdateCompletedPayload;
//# sourceMappingURL=user-quiz-question-update-completed.js.map