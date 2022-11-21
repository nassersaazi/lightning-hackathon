"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationError = exports.AuthenticationError = exports.InsufficientLiquidityError = exports.UsernameError = exports.InvalidBusinessTitleLengthError = exports.InvalidCoordinatesError = exports.PhoneProviderError = exports.PhoneCodeError = exports.InvoiceDecodeError = exports.TwoFAError = exports.OnChainFeeEstimationError = exports.CaptchaFailedError = exports.DealerOfflineError = exports.LndOfflineError = exports.DustAmountError = exports.RebalanceNeededError = exports.RouteFindingError = exports.OnChainPaymentError = exports.LightningPaymentError = exports.DbError = exports.TooManyRequestError = exports.NewAccountWithdrawalError = exports.NotFoundError = exports.InputValidationError = exports.ValidationInternalError = exports.SelfPaymentError = exports.InsufficientBalanceError = exports.UnexpectedClientError = exports.UnknownClientError = exports.TransactionRestrictedError = exports.CustomApolloError = void 0;
const apollo_server_errors_1 = require("apollo-server-errors");
const _config_1 = require("../config/index");
const logger_1 = require("../services/logger");
const onChainWalletConfig = (0, _config_1.getOnChainWalletConfig)();
class CustomApolloError extends apollo_server_errors_1.ApolloError {
    constructor({ message, code, forwardToClient, logger, level, ...metadata }) {
        super(message ?? code, code, metadata);
        this.log = logger[level || "warn"].bind(logger);
        this.forwardToClient = forwardToClient || false;
    }
}
exports.CustomApolloError = CustomApolloError;
class TransactionRestrictedError extends CustomApolloError {
    constructor(errData) {
        super({ code: "TRANSACTION_RESTRICTED", forwardToClient: true, ...errData });
    }
}
exports.TransactionRestrictedError = TransactionRestrictedError;
class UnknownClientError extends CustomApolloError {
    constructor(errData) {
        super({ code: "UNKNOWN_CLIENT_ERROR", forwardToClient: true, ...errData });
    }
}
exports.UnknownClientError = UnknownClientError;
class UnexpectedClientError extends CustomApolloError {
    constructor(errData) {
        super({ code: "UNEXPECTED_CLIENT_ERROR", forwardToClient: true, ...errData });
    }
}
exports.UnexpectedClientError = UnexpectedClientError;
class InsufficientBalanceError extends CustomApolloError {
    constructor(errData) {
        super({
            code: "INSUFFICIENT_BALANCE",
            message: "balance is too low",
            forwardToClient: true,
            ...errData,
        });
    }
}
exports.InsufficientBalanceError = InsufficientBalanceError;
class SelfPaymentError extends CustomApolloError {
    constructor(errData) {
        super({
            code: "CANT_PAY_SELF",
            message: "User tried to pay themselves",
            forwardToClient: true,
            ...errData,
        });
    }
}
exports.SelfPaymentError = SelfPaymentError;
class ValidationInternalError extends CustomApolloError {
    constructor(errData) {
        super({ code: "INVALID_INPUT", forwardToClient: true, ...errData });
    }
}
exports.ValidationInternalError = ValidationInternalError;
class InputValidationError extends CustomApolloError {
    constructor(errData) {
        super({
            code: "INVALID_INPUT",
            forwardToClient: true,
            ...errData,
            logger: logger_1.baseLogger,
        });
    }
}
exports.InputValidationError = InputValidationError;
class NotFoundError extends CustomApolloError {
    constructor(errData) {
        super({ code: "NOT_FOUND", forwardToClient: true, ...errData });
    }
}
exports.NotFoundError = NotFoundError;
class NewAccountWithdrawalError extends CustomApolloError {
    constructor(errData) {
        super({
            code: "NEW_ACCOUNT_WITHDRAWAL_RESTRICTED",
            forwardToClient: true,
            ...errData,
        });
    }
}
exports.NewAccountWithdrawalError = NewAccountWithdrawalError;
class TooManyRequestError extends CustomApolloError {
    constructor(errData) {
        super({
            code: "TOO_MANY_REQUEST",
            message: "Too many requests",
            forwardToClient: true,
            ...errData,
        });
    }
}
exports.TooManyRequestError = TooManyRequestError;
class DbError extends CustomApolloError {
    constructor(errData) {
        super({ code: "DB_ERROR", forwardToClient: true, ...errData });
    }
}
exports.DbError = DbError;
class LightningPaymentError extends CustomApolloError {
    constructor(errData) {
        super({ code: "LIGHTNING_PAYMENT_ERROR", forwardToClient: true, ...errData });
    }
}
exports.LightningPaymentError = LightningPaymentError;
class OnChainPaymentError extends CustomApolloError {
    constructor(errData) {
        super({ code: "ONCHAIN_PAYMENT_ERROR", forwardToClient: true, ...errData });
    }
}
exports.OnChainPaymentError = OnChainPaymentError;
class RouteFindingError extends CustomApolloError {
    constructor(errData) {
        super({
            code: "ROUTE_FINDING_ERROR",
            message: "Unable to find a route for payment",
            forwardToClient: true,
            ...errData,
        });
    }
}
exports.RouteFindingError = RouteFindingError;
class RebalanceNeededError extends CustomApolloError {
    constructor(errData) {
        super({
            code: "REBALANCE_NEEDED",
            message: "Insufficient onchain balance on lnd",
            level: "error",
            forwardToClient: false,
            ...errData,
        });
    }
}
exports.RebalanceNeededError = RebalanceNeededError;
class DustAmountError extends CustomApolloError {
    constructor(errData) {
        super({
            code: "ENTERED_DUST_AMOUNT",
            message: `Use lightning to send amounts less than ${onChainWalletConfig.dustThreshold}`,
            forwardToClient: true,
            ...errData,
        });
    }
}
exports.DustAmountError = DustAmountError;
class LndOfflineError extends CustomApolloError {
    constructor(errData) {
        super({ code: "LND_OFFLINE", forwardToClient: true, ...errData, logger: logger_1.baseLogger });
    }
}
exports.LndOfflineError = LndOfflineError;
class DealerOfflineError extends CustomApolloError {
    constructor(errData) {
        super({
            code: "DEALER_OFFLINE",
            forwardToClient: true,
            ...errData,
            logger: logger_1.baseLogger,
        });
    }
}
exports.DealerOfflineError = DealerOfflineError;
class CaptchaFailedError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Unable to estimate onchain fee",
            forwardToClient: true,
            code: "REJECTED_CAPTCHA_FAILED",
            ...errData,
        });
    }
}
exports.CaptchaFailedError = CaptchaFailedError;
class OnChainFeeEstimationError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Unable to estimate onchain fee",
            forwardToClient: true,
            code: "ONCHAIN_FEE_ESTIMATION_ERROR",
            ...errData,
        });
    }
}
exports.OnChainFeeEstimationError = OnChainFeeEstimationError;
class TwoFAError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Incorrect code",
            forwardToClient: true,
            code: "2FA_ERROR",
            ...errData,
        });
    }
}
exports.TwoFAError = TwoFAError;
class InvoiceDecodeError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Unable to decode invoice",
            forwardToClient: true,
            code: "INVOICE_DECODE_ERROR",
            ...errData,
        });
    }
}
exports.InvoiceDecodeError = InvoiceDecodeError;
class PhoneCodeError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Incorrect phone code",
            forwardToClient: true,
            code: "PHONE_CODE_ERROR",
            ...errData,
        });
    }
}
exports.PhoneCodeError = PhoneCodeError;
class PhoneProviderError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Issue with phone provider",
            forwardToClient: true,
            code: "PHONE_PROVIDER_ERROR",
            ...errData,
        });
    }
}
exports.PhoneProviderError = PhoneProviderError;
class InvalidCoordinatesError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Latitude must be between -90 and 90 and longitude between -180 and 180",
            forwardToClient: true,
            code: "INVALID_COORDINATES",
            ...errData,
        });
    }
}
exports.InvalidCoordinatesError = InvalidCoordinatesError;
class InvalidBusinessTitleLengthError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Title should be between 3 and 100 characters long",
            forwardToClient: true,
            code: "INVALID_TITLE",
            ...errData,
        });
    }
}
exports.InvalidBusinessTitleLengthError = InvalidBusinessTitleLengthError;
class UsernameError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Username issue",
            forwardToClient: true,
            code: "USERNAME_ERROR",
            ...errData,
        });
    }
}
exports.UsernameError = UsernameError;
class InsufficientLiquidityError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Temporary funds offline issue",
            forwardToClient: true,
            code: "LIQUIDITY_ERROR",
            ...errData,
        });
    }
}
exports.InsufficientLiquidityError = InsufficientLiquidityError;
class AuthenticationError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Not authenticated",
            forwardToClient: true,
            code: "NOT_AUTHENTICATED",
            ...errData,
        });
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends CustomApolloError {
    constructor(errData) {
        super({
            message: "Not authorized",
            forwardToClient: true,
            code: "NOT_AUTHORIZED",
            ...errData,
        });
    }
}
exports.AuthorizationError = AuthorizationError;
//# sourceMappingURL=error.js.map