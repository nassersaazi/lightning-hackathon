"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPushNotificationContent = void 0;
const _config_1 = require("../../config/index");
const shared_1 = require("../../domain/shared");
const i18n = (0, _config_1.getI18nInstance)();
const defaultLocale = (0, _config_1.getLocale)();
const createPushNotificationContent = ({ type, amount, displayAmount, userLanguage, }) => {
    const locale = userLanguage || defaultLocale;
    const baseCurrency = amount.currency;
    const notificationType = type === "balance" ? type : `transaction.${type}`;
    const title = i18n.__({ phrase: `notification.${notificationType}.title`, locale }, { walletCurrency: baseCurrency });
    const baseCurrencyName = baseCurrency === shared_1.WalletCurrency.Btc ? "sats" : "";
    const baseCurrencySymbol = baseCurrency === shared_1.WalletCurrency.Usd ? "$" : "";
    const displayedBaseAmount = baseCurrency === shared_1.WalletCurrency.Usd ? Number(amount.amount) / 100 : amount.amount;
    const baseCurrencyAmount = displayedBaseAmount.toLocaleString(locale, {
        maximumFractionDigits: 2,
    });
    let body = i18n.__({ phrase: `notification.${notificationType}.body`, locale }, {
        baseCurrencySymbol,
        baseCurrencyAmount,
        baseCurrencyName: baseCurrencyName ? ` ${baseCurrencyName}` : "",
    });
    if (displayAmount &&
        displayAmount.amount > 0 &&
        displayAmount.currency !== baseCurrency) {
        const displayCurrencyName = i18n.__({
            phrase: `currency.${displayAmount.currency}.name`,
            locale,
        });
        const displayCurrencySymbol = i18n.__({
            phrase: `currency.${displayAmount.currency}.symbol`,
            locale,
        });
        const displayCurrencyAmount = displayAmount.amount.toLocaleString(locale, {
            maximumFractionDigits: 2,
        });
        body = i18n.__({ phrase: `notification.${notificationType}.bodyDisplayCurrency`, locale }, {
            displayCurrencySymbol,
            displayCurrencyAmount,
            displayCurrencyName: displayCurrencyName ? ` ${displayCurrencyName}` : "",
            baseCurrencySymbol,
            baseCurrencyAmount,
            baseCurrencyName: baseCurrencyName ? ` ${baseCurrencyName}` : "",
        });
    }
    return { title, body };
};
exports.createPushNotificationContent = createPushNotificationContent;
//# sourceMappingURL=create-push-notification-content.js.map