"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../app/index");
const accounts_1 = require("../../../domain/accounts");
const index_1 = require("../../index");
const dedent_1 = __importDefault(require("dedent"));
const connections_1 = require("../../connections");
const contact_alias_1 = __importDefault(require("../scalar/contact-alias"));
const username_1 = __importDefault(require("../scalar/username"));
const transaction_1 = require("./transaction");
const AccountContact = index_1.GT.Object({
    name: "UserContact",
    fields: () => ({
        id: { type: index_1.GT.NonNull(username_1.default) },
        username: {
            type: index_1.GT.NonNull(username_1.default),
            description: "Actual identifier of the contact.",
        },
        alias: {
            type: contact_alias_1.default,
            description: (0, dedent_1.default) `Alias the user can set for this contact.
        Only the user can see the alias attached to their contact.`,
        },
        transactionsCount: {
            type: index_1.GT.NonNull(index_1.GT.Int),
        },
        transactions: {
            type: transaction_1.TransactionConnection,
            args: connections_1.connectionArgs,
            resolve: async (source, args, { domainAccount }) => {
                if (!source.username) {
                    throw new Error("Missing username for contact");
                }
                const contactUsername = (0, accounts_1.checkedToUsername)(source.username);
                if (contactUsername instanceof Error) {
                    throw contactUsername;
                }
                const account = domainAccount;
                if (account instanceof Error) {
                    throw account;
                }
                const transactions = await _app_1.Accounts.getAccountTransactionsForContact({
                    account,
                    contactUsername,
                });
                if (transactions instanceof Error) {
                    throw transactions;
                }
                return (0, connections_1.connectionFromArray)(transactions, args);
            },
            description: "Paginated list of transactions sent to/from this contact.",
        },
    }),
});
exports.default = AccountContact;
//# sourceMappingURL=account-contact.js.map