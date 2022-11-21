"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const user_contact_update_alias_1 = __importDefault(require("../../types/payload/user-contact-update-alias"));
const contact_alias_1 = __importDefault(require("../../types/scalar/contact-alias"));
const username_1 = __importDefault(require("../../types/scalar/username"));
const _app_1 = require("../../../app/index");
const error_1 = require("../../error");
const UserContactUpdateAliasInput = index_1.GT.Input({
    name: "UserContactUpdateAliasInput",
    fields: () => ({
        username: { type: index_1.GT.NonNull(username_1.default) },
        alias: { type: index_1.GT.NonNull(contact_alias_1.default) },
    }),
});
const UserContactUpdateAliasMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(user_contact_update_alias_1.default),
    args: {
        input: { type: index_1.GT.NonNull(UserContactUpdateAliasInput) },
    },
    deprecationReason: "will be moved to AccountContact",
    resolve: async (_, args, { domainAccount }) => {
        const { username, alias } = args.input;
        if (username instanceof error_1.InputValidationError) {
            return { errors: [{ message: username.message }] };
        }
        if (alias instanceof error_1.InputValidationError) {
            return { errors: [{ message: alias.message }] };
        }
        const accountId = domainAccount.id;
        const contact = await _app_1.Accounts.updateContactAlias({
            accountId,
            username,
            alias,
        });
        if (contact instanceof Error) {
            return { errors: [{ message: contact.message }] };
        }
        return {
            errors: [],
            contact,
        };
    },
});
exports.default = UserContactUpdateAliasMutation;
//# sourceMappingURL=user-contact-update-alias.js.map