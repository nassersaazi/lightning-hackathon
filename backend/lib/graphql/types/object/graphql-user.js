"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_by_string_1 = __importDefault(require("uuid-by-string"));
const dedent_1 = __importDefault(require("dedent"));
const index_1 = require("../../index");
const _app_1 = require("../../../app/index");
const error_1 = require("../../error");
const logger_1 = require("../../../services/logger");
const account_1 = __importDefault(require("../abstract/account"));
const timestamp_1 = __importDefault(require("../scalar/timestamp"));
const language_1 = __importDefault(require("../scalar/language"));
const phone_1 = __importDefault(require("../scalar/phone"));
const username_1 = __importDefault(require("../scalar/username"));
const account_contact_1 = __importDefault(require("./account-contact"));
const user_quiz_question_1 = __importDefault(require("./user-quiz-question"));
const GraphQLUser = index_1.GT.Object({
    name: "User",
    fields: () => ({
        id: {
            type: index_1.GT.NonNullID,
            // TODO after migration to oathkeeper/kratos, remove getUuidByString
            // eventually add a uuiv v4 to accounts so that there is no longer
            //  ID dependency on mongodb
            resolve: (source) => (0, uuid_by_string_1.default)(source.id),
        },
        phone: {
            type: phone_1.default,
            description: "Phone number with international calling code.",
        },
        username: {
            type: username_1.default,
            description: "Optional immutable user friendly identifier.",
            resolve: async (source, args, { domainAccount }) => {
                return domainAccount?.username || source.username;
            },
            deprecationReason: "will be moved to @Handle in Account and Wallet",
        },
        language: {
            type: index_1.GT.NonNull(language_1.default),
            description: (0, dedent_1.default) `Preferred language for user.
        When value is 'default' the intent is to use preferred language from OS settings.`,
        },
        quizQuestions: {
            deprecationReason: `will be moved to Accounts`,
            type: index_1.GT.NonNullList(user_quiz_question_1.default),
            description: "List the quiz questions the user may have completed.",
        },
        contacts: {
            deprecationReason: "will be moved to account",
            type: index_1.GT.NonNullList(account_contact_1.default),
            description: (0, dedent_1.default) `Get full list of contacts.
        Can include the transactions associated with each contact.`,
            resolve: async (source, args, { domainAccount }) => domainAccount?.contacts,
        },
        contactByUsername: {
            type: index_1.GT.NonNull(account_contact_1.default),
            description: (0, dedent_1.default) `Get single contact details.
        Can include the transactions associated with the contact.`,
            deprecationReason: `will be moved to Accounts`,
            args: {
                username: { type: index_1.GT.NonNull(username_1.default) },
            },
            resolve: async (source, args, { domainAccount }) => {
                const { username } = args;
                if (!domainAccount) {
                    throw new error_1.UnknownClientError({
                        message: "Something went wrong",
                        logger: logger_1.baseLogger,
                    });
                }
                if (username instanceof Error) {
                    throw username;
                }
                const contact = await _app_1.Accounts.getContactByUsername({
                    account: domainAccount,
                    contactUsername: username,
                });
                if (contact instanceof Error) {
                    throw contact;
                }
                return contact;
            },
        },
        createdAt: {
            type: index_1.GT.NonNull(timestamp_1.default),
        },
        defaultAccount: {
            type: index_1.GT.NonNull(account_1.default),
            resolve: async (source, args, { domainAccount }) => {
                return domainAccount;
            },
        },
        // FUTURE-PLAN: support an `accounts: [Account!]!` here
    }),
});
exports.default = GraphQLUser;
//# sourceMappingURL=graphql-user.js.map