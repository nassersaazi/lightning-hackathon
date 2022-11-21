"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEarn = void 0;
const _app_1 = require("../index");
const _config_1 = require("../../config/index");
const errors_1 = require("../../domain/errors");
const shared_1 = require("../../domain/shared");
const ip_metadata_validator_1 = require("../../domain/users-ips/ip-metadata-validator");
const phone_metadata_validator_1 = require("../../domain/users/phone-metadata-validator");
const caching_1 = require("../../services/ledger/caching");
const mongoose_1 = require("../../services/mongoose");
const users_ips_1 = require("../../services/mongoose/users-ips");
const rewardsConfig = (0, _config_1.getRewardsConfig)();
const addEarn = async ({ quizQuestionId, accountId, }) => {
    const amount = _config_1.onboardingEarn[quizQuestionId];
    if (!amount)
        return new errors_1.InvalidQuizQuestionIdError();
    const funderWalletId = await (0, caching_1.getFunderWalletId)();
    const funderWallet = await (0, mongoose_1.WalletsRepository)().findById(funderWalletId);
    if (funderWallet instanceof Error)
        return funderWallet;
    const funderAccount = await (0, mongoose_1.AccountsRepository)().findById(funderWallet.accountId);
    if (funderAccount instanceof Error)
        return funderAccount;
    const recipientAccount = await (0, mongoose_1.AccountsRepository)().findById(accountId);
    if (recipientAccount instanceof Error)
        return recipientAccount;
    const user = await (0, mongoose_1.UsersRepository)().findById(recipientAccount.ownerId);
    if (user instanceof Error)
        return user;
    const validatedPhoneMetadata = (0, phone_metadata_validator_1.PhoneMetadataValidator)(rewardsConfig).validateForReward(user.phoneMetadata);
    if (validatedPhoneMetadata instanceof Error)
        return new errors_1.InvalidPhoneMetadataForRewardError(validatedPhoneMetadata.name);
    const userIps = await (0, users_ips_1.UsersIpRepository)().findById(recipientAccount.ownerId);
    if (userIps instanceof Error)
        return userIps;
    const lastIPs = userIps.lastIPs;
    const lastIp = lastIPs.length > 0 ? lastIPs[lastIPs.length - 1] : undefined;
    const validatedIPMetadata = (0, ip_metadata_validator_1.IPMetadataValidator)(rewardsConfig).validateForReward(lastIp);
    if (validatedIPMetadata instanceof Error) {
        return new errors_1.InvalidIPMetadataForRewardError(validatedIPMetadata.name);
    }
    const recipientWallets = await (0, mongoose_1.WalletsRepository)().listByAccountId(accountId);
    if (recipientWallets instanceof Error)
        return recipientWallets;
    const recipientBtcWallet = recipientWallets.find((wallet) => wallet.currency === shared_1.WalletCurrency.Btc);
    if (recipientBtcWallet === undefined)
        return new errors_1.NoBtcWalletExistsForAccountError();
    const recipientWalletId = recipientBtcWallet.id;
    const shouldGiveReward = await (0, mongoose_1.RewardsRepository)(accountId).add(quizQuestionId);
    if (shouldGiveReward instanceof Error)
        return shouldGiveReward;
    const payment = await _app_1.Payments.intraledgerPaymentSendWalletId({
        senderWalletId: funderWalletId,
        recipientWalletId,
        amount,
        memo: quizQuestionId,
        senderAccount: funderAccount,
    });
    if (payment instanceof Error)
        return payment;
    return { id: quizQuestionId, earnAmount: amount };
};
exports.addEarn = addEarn;
//# sourceMappingURL=add-earn.js.map