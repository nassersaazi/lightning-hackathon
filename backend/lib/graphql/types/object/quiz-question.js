"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const sat_amount_1 = __importDefault(require("../scalar/sat-amount"));
const QuizQuestion = index_1.GT.Object({
    name: "QuizQuestion",
    fields: () => ({
        id: { type: index_1.GT.NonNullID },
        earnAmount: {
            type: index_1.GT.NonNull(sat_amount_1.default),
            description: "The earn reward in Satoshis for the quiz question",
        },
    }),
});
exports.default = QuizQuestion;
//# sourceMappingURL=quiz-question.js.map