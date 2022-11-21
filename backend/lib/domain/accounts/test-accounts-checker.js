"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestAccountsChecker = void 0;
const TestAccountsChecker = (testAccounts) => ({
    isPhoneValid: (phone) => testAccounts.findIndex((item) => item.phone === phone) !== -1,
    isPhoneAndCodeValid: ({ code, phone }) => testAccounts.findIndex((item) => item.phone === phone) !== -1 &&
        testAccounts.filter((item) => item.phone === phone)[0].code.toString() ===
            code.toString(),
});
exports.TestAccountsChecker = TestAccountsChecker;
//# sourceMappingURL=test-accounts-checker.js.map