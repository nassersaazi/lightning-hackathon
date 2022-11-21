"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const username_1 = __importDefault(require("../../types/scalar/username"));
const _app_1 = require("../../../app/index");
const UsernameAvailableQuery = index_1.GT.Field({
    type: index_1.GT.Boolean,
    args: {
        username: {
            type: index_1.GT.NonNull(username_1.default),
        },
    },
    resolve: async (_, args) => {
        const { username } = args;
        if (username instanceof Error) {
            throw username;
        }
        const available = await _app_1.Accounts.usernameAvailable(username);
        if (available instanceof Error) {
            throw available;
        }
        return available;
    },
});
exports.default = UsernameAvailableQuery;
//# sourceMappingURL=username-available.js.map