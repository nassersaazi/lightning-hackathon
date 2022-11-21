"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentInputValidator = void 0;
const accounts_1 = require("../accounts");
const bitcoin_1 = require("../bitcoin");
const errors_1 = require("../errors");
const wallets_1 = require("./");
const PaymentInputValidator = (getWalletFn) => {
    const validatePaymentInput = async ({ amount, senderWalletId: uncheckedSenderWalletId, senderAccount, recipientWalletId: uncheckedRecipientWalletId, }) => {
        const validAmount = (0, bitcoin_1.checkedToCurrencyBaseAmount)(amount);
        if (validAmount instanceof Error)
            return validAmount;
        if (senderAccount.status !== accounts_1.AccountStatus.Active) {
            return new errors_1.InactiveAccountError(senderAccount.id);
        }
        const senderWalletId = (0, wallets_1.checkedToWalletId)(uncheckedSenderWalletId);
        if (senderWalletId instanceof Error)
            return senderWalletId;
        const senderWallet = await getWalletFn(senderWalletId);
        if (senderWallet instanceof Error)
            return senderWallet;
        if (senderWallet.accountId !== senderAccount.id)
            return new errors_1.InvalidWalletId();
        if (uncheckedRecipientWalletId) {
            const recipientWalletId = (0, wallets_1.checkedToWalletId)(uncheckedRecipientWalletId);
            if (recipientWalletId instanceof Error)
                return recipientWalletId;
            const recipientWallet = await getWalletFn(recipientWalletId);
            if (recipientWallet instanceof Error)
                return recipientWallet;
            if (recipientWallet.id === senderWallet.id)
                return new errors_1.SelfPaymentError();
            return {
                amount: validAmount,
                senderWallet,
                recipientWallet,
            };
        }
        return {
            amount: validAmount,
            senderWallet,
        };
    };
    return {
        validatePaymentInput,
    };
};
exports.PaymentInputValidator = PaymentInputValidator;
//# sourceMappingURL=payment-input-validator.js.map