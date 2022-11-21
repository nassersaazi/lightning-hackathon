"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const device_notification_token_create_1 = __importDefault(require("../root/mutation/device-notification-token-create"));
const intraledger_payment_send_1 = __importDefault(require("../root/mutation/intraledger-payment-send"));
const intraledger_usd_payment_send_1 = __importDefault(require("../root/mutation/intraledger-usd-payment-send"));
const ln_invoice_create_1 = __importDefault(require("../root/mutation/ln-invoice-create"));
const ln_usd_invoice_create_1 = __importDefault(require("../root/mutation/ln-usd-invoice-create"));
const ln_invoice_create_on_behalf_of_recipient_1 = __importDefault(require("../root/mutation/ln-invoice-create-on-behalf-of-recipient"));
const ln_usd_invoice_create_on_behalf_of_recipient_1 = __importDefault(require("../root/mutation/ln-usd-invoice-create-on-behalf-of-recipient"));
const ln_invoice_fee_probe_1 = __importDefault(require("../root/mutation/ln-invoice-fee-probe"));
const ln_usd_invoice_fee_probe_1 = __importDefault(require("../root/mutation/ln-usd-invoice-fee-probe"));
const ln_invoice_payment_send_1 = __importDefault(require("../root/mutation/ln-invoice-payment-send"));
const ln_noamount_invoice_create_1 = __importDefault(require("../root/mutation/ln-noamount-invoice-create"));
const ln_noamount_invoice_create_on_behalf_of_recipient_1 = __importDefault(require("../root/mutation/ln-noamount-invoice-create-on-behalf-of-recipient"));
const ln_noamount_invoice_fee_probe_1 = __importDefault(require("../root/mutation/ln-noamount-invoice-fee-probe"));
const ln_noamount_usd_invoice_fee_probe_1 = __importDefault(require("../root/mutation/ln-noamount-usd-invoice-fee-probe"));
const ln_noamount_invoice_payment_send_1 = __importDefault(require("../root/mutation/ln-noamount-invoice-payment-send"));
const ln_noamount_usd_invoice_payment_send_1 = __importDefault(require("../root/mutation/ln-noamount-usd-invoice-payment-send"));
const on_chain_address_create_1 = __importDefault(require("../root/mutation/on-chain-address-create"));
const on_chain_address_current_1 = __importDefault(require("../root/mutation/on-chain-address-current"));
const user_login_1 = __importDefault(require("../root/mutation/user-login"));
const user_request_auth_code_1 = __importDefault(require("../root/mutation/user-request-auth-code"));
const user_update_language_1 = __importDefault(require("../root/mutation/user-update-language"));
const user_update_username_1 = __importDefault(require("../root/mutation/user-update-username"));
const account_update_default_wallet_id_1 = __importDefault(require("../root/mutation/account-update-default-wallet-id"));
const user_contact_update_alias_1 = __importDefault(require("../root/mutation/user-contact-update-alias"));
const user_quiz_question_update_completed_1 = __importDefault(require("../root/mutation/user-quiz-question-update-completed"));
const onchain_payment_send_1 = __importDefault(require("../root/mutation/onchain-payment-send"));
const onchain_payment_send_all_1 = __importDefault(require("../root/mutation/onchain-payment-send-all"));
const captcha_request_auth_code_1 = __importDefault(require("../root/mutation/captcha-request-auth-code"));
const captcha_create_challenge_1 = __importDefault(require("../root/mutation/captcha-create-challenge"));
// TODO: // const fields: { [key: string]: GraphQLFieldConfig<any, GraphQLContext> }
const fields = {
    // unauthed
    userRequestAuthCode: user_request_auth_code_1.default,
    userLogin: user_login_1.default,
    captchaCreateChallenge: captcha_create_challenge_1.default,
    captchaRequestAuthCode: captcha_request_auth_code_1.default,
    lnInvoiceCreateOnBehalfOfRecipient: ln_invoice_create_on_behalf_of_recipient_1.default,
    lnUsdInvoiceCreateOnBehalfOfRecipient: ln_usd_invoice_create_on_behalf_of_recipient_1.default,
    lnNoAmountInvoiceCreateOnBehalfOfRecipient: ln_noamount_invoice_create_on_behalf_of_recipient_1.default,
    // authed
    userQuizQuestionUpdateCompleted: user_quiz_question_update_completed_1.default,
    deviceNotificationTokenCreate: device_notification_token_create_1.default,
    userUpdateLanguage: user_update_language_1.default,
    userUpdateUsername: user_update_username_1.default,
    accountUpdateDefaultWalletId: account_update_default_wallet_id_1.default,
    userContactUpdateAlias: user_contact_update_alias_1.default,
    lnInvoiceFeeProbe: ln_invoice_fee_probe_1.default,
    lnUsdInvoiceFeeProbe: ln_usd_invoice_fee_probe_1.default,
    lnNoAmountInvoiceFeeProbe: ln_noamount_invoice_fee_probe_1.default,
    lnNoAmountUsdInvoiceFeeProbe: ln_noamount_usd_invoice_fee_probe_1.default,
    lnInvoiceCreate: ln_invoice_create_1.default,
    lnUsdInvoiceCreate: ln_usd_invoice_create_1.default,
    lnNoAmountInvoiceCreate: ln_noamount_invoice_create_1.default,
    lnInvoicePaymentSend: ln_invoice_payment_send_1.default,
    lnNoAmountInvoicePaymentSend: ln_noamount_invoice_payment_send_1.default,
    lnNoAmountUsdInvoicePaymentSend: ln_noamount_usd_invoice_payment_send_1.default,
    intraLedgerPaymentSend: intraledger_payment_send_1.default,
    intraLedgerUsdPaymentSend: intraledger_usd_payment_send_1.default,
    onChainAddressCreate: on_chain_address_create_1.default,
    onChainAddressCurrent: on_chain_address_current_1.default,
    onChainPaymentSend: onchain_payment_send_1.default,
    onChainPaymentSendAll: onchain_payment_send_all_1.default,
};
const MutationType = index_1.GT.Object({
    name: "Mutation",
    fields,
});
exports.default = MutationType;
//# sourceMappingURL=mutations.js.map