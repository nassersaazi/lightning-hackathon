"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const AccountLevel = index_1.GT.Enum({
    name: "AccountLevel",
    values: {
        ONE: { value: 1 },
        TWO: { value: 2 }, // We have the user's identity
    },
});
exports.default = AccountLevel;
//# sourceMappingURL=account-level.js.map