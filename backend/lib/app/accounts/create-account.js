"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccountForEmailIdentifier = exports.createAccountWithPhoneIdentifier = void 0;
const _config_1 = require("../../config/index");
const shared_1 = require("../../domain/shared");
const wallets_1 = require("../../domain/wallets");
const logger_1 = require("../../services/logger");
const mongoose_1 = require("../../services/mongoose");
const twilio_1 = require("../../services/twilio");
const initializeCreatedAccount = async ({ account, config, phoneNumberValid, }) => {
    const newWallet = (currency) => (0, mongoose_1.WalletsRepository)().persistNew({
        accountId: account.id,
        type: wallets_1.WalletType.Checking,
        currency,
    });
    const walletsEnabledConfig = config.initialWallets;
    // Create all wallets
    const enabledWallets = {};
    for (const currency of walletsEnabledConfig) {
        const wallet = await newWallet(currency);
        if (wallet instanceof Error)
            return wallet;
        enabledWallets[currency] = wallet;
    }
    // Set default wallet explicitly as BTC, or implicitly as 1st element in
    // walletsEnabledConfig array.
    const defaultWalletId = enabledWallets[shared_1.WalletCurrency.Btc]?.id || enabledWallets[walletsEnabledConfig[0]]?.id;
    if (defaultWalletId === undefined) {
        return new _config_1.ConfigError("NoWalletsEnabledInConfigError");
    }
    account.defaultWalletId = defaultWalletId;
    // FIXME: to remove when Casbin is been introduced
    const role = (0, _config_1.getTestAccounts)().find(({ phone }) => phone === phoneNumberValid)?.role;
    account.role = role || "user";
    account.contactEnabled = account.role === "user" || account.role === "editor";
    const updatedAccount = await (0, mongoose_1.AccountsRepository)().update(account);
    if (updatedAccount instanceof Error)
        return updatedAccount;
    return updatedAccount;
};
const createAccountWithPhoneIdentifier = async ({ newAccountInfo: { kratosUserId, phone, phoneMetadata }, config, }) => {
    const accountsRepo = (0, mongoose_1.AccountsRepository)();
    const accountRaw = {
        phone,
        phoneMetadata,
        kratosUserId,
    };
    if (!phoneMetadata && !!phone) {
        const carrierInfo = await (0, twilio_1.TwilioClient)().getCarrier(phone);
        if (carrierInfo instanceof Error) {
            // non fatal error
            logger_1.baseLogger.warn({ phone }, "impossible to fetch carrier");
        }
        else {
            accountRaw.phoneMetadata = carrierInfo;
        }
    }
    let account = await accountsRepo.persistNew(accountRaw);
    if (account instanceof Error)
        return account;
    account = await initializeCreatedAccount({ account, config, phoneNumberValid: phone });
    if (account instanceof Error)
        return account;
    return account;
};
exports.createAccountWithPhoneIdentifier = createAccountWithPhoneIdentifier;
// kratos user already exist, as he has been using self registration
const createAccountForEmailIdentifier = async ({ kratosUserId, config, }) => {
    let account = await (0, mongoose_1.AccountsRepository)().persistNew({ kratosUserId });
    if (account instanceof Error)
        return account;
    account = await initializeCreatedAccount({ account, config });
    if (account instanceof Error)
        return account;
    return account;
};
exports.createAccountForEmailIdentifier = createAccountForEmailIdentifier;
//# sourceMappingURL=create-account.js.map