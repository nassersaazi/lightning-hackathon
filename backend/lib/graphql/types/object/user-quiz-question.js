"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const quiz_question_1 = __importDefault(require("./quiz-question"));
const UserQuizQuestion = index_1.GT.Object({
    name: "UserQuizQuestion",
    fields: () => ({
        question: { type: index_1.GT.NonNull(quiz_question_1.default) },
        completed: {
            type: index_1.GT.NonNull(index_1.GT.Boolean),
        },
    }),
});
exports.default = UserQuizQuestion;
//# sourceMappingURL=user-quiz-question.js.map