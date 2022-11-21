"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const accounts_1 = require("../../../../domain/accounts");
const index_1 = require("../../../index");
const AccountStatus = index_1.GT.Enum({
    name: "AccountStatus",
    values: {
        NEW: { value: accounts_1.AccountStatus.New },
        PENDING: { value: accounts_1.AccountStatus.Pending },
        ACTIVE: { value: accounts_1.AccountStatus.Active },
        LOCKED: { value: accounts_1.AccountStatus.Locked },
    },
});
exports.default = AccountStatus;
//# sourceMappingURL=account-status.js.map