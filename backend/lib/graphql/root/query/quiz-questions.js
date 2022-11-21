"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const quiz_question_1 = __importDefault(require("../../types/object/quiz-question"));
const _config_1 = require("../../../config/index");
const QuizQuestionsQuery = index_1.GT.Field({
    type: index_1.GT.List(quiz_question_1.default),
    resolve: async () => {
        return Object.entries(_config_1.onboardingEarn).map(([id, earnAmount]) => ({
            id,
            earnAmount,
        }));
    },
});
exports.default = QuizQuestionsQuery;
//# sourceMappingURL=quiz-questions.js.map