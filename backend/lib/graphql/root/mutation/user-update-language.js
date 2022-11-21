"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const error_map_1 = require("../../error-map");
const index_1 = require("../../index");
const user_update_language_1 = __importDefault(require("../../types/payload/user-update-language"));
const language_1 = __importDefault(require("../../types/scalar/language"));
const UserUpdateLanguageInput = index_1.GT.Input({
    name: "UserUpdateLanguageInput",
    fields: () => ({
        language: { type: index_1.GT.NonNull(language_1.default) },
    }),
});
const UserUpdateLanguageMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(user_update_language_1.default),
    args: {
        input: { type: index_1.GT.NonNull(UserUpdateLanguageInput) },
    },
    resolve: async (_, args, { domainUser }) => {
        const { language } = args.input;
        if (language instanceof Error) {
            return { errors: [{ message: language.message }] };
        }
        const result = await _app_1.Users.updateLanguage({ userId: domainUser.id, language });
        if (result instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(result)] };
        }
        return {
            errors: [],
            user: result,
        };
    },
});
exports.default = UserUpdateLanguageMutation;
//# sourceMappingURL=user-update-language.js.map