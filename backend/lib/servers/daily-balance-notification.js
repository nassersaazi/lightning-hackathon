"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const send_default_wallet_balance_to_users_1 = require("../app/accounts/send-default-wallet-balance-to-users");
const logger_1 = require("../services/logger");
const mongodb_1 = require("../services/mongodb");
const main = async () => {
    const mongoose = await (0, mongodb_1.setupMongoConnection)();
    // We're not using the Accounts.sendDefaultWalletBalanceToUsers() call pattern
    // because the root span becomes much too large. By calling the function directly
    // we bypass the wrapper.
    await (0, send_default_wallet_balance_to_users_1.sendDefaultWalletBalanceToUsers)();
    await mongoose.connection.close();
};
if (require.main === module) {
    try {
        main();
    }
    catch (err) {
        logger_1.baseLogger.warn({ err }, "error in the dailyBalanceNotification job");
    }
}
//# sourceMappingURL=daily-balance-notification.js.map