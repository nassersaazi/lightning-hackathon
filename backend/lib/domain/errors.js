"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidContactAlias = exports.InvalidUsername = exports.SatoshiAmountRequiredError = exports.InvalidScanDepthAmount = exports.InvalidPubKeyError = exports.InvalidOnChainAddress = exports.NonIntegerError = exports.InvalidUsdCents = exports.InvalidSatoshiAmountError = exports.InvalidCurrencyBaseAmountError = exports.InvalidWithdrawFeeError = exports.ContactNotExistentError = exports.MissingPhoneError = exports.InvalidNegativeAmountError = exports.NotReachableError = exports.NotImplementedError = exports.RewardAlreadyPresentError = exports.CouldNotFindAccountFromKratosIdError = exports.CouldNotFindTransactionsForAccountError = exports.CouldNotFindAccountFromPhoneError = exports.CouldNotFindAccountFromUsernameError = exports.CouldNotFindLnPaymentFromHashError = exports.CouldNotFindBtcWalletForAccountError = exports.NoExpiredLightningPaymentFlowsError = exports.CouldNotUpdateLightningPaymentFlowError = exports.CouldNotFindLightningPaymentFlowError = exports.NoTransactionToUpdateError = exports.CouldNotListWalletsFromWalletCurrencyError = exports.CouldNotFindWalletFromOnChainAddressesError = exports.CouldNotFindWalletFromOnChainAddressError = exports.CouldNotFindWalletFromUsernameAndCurrencyError = exports.CouldNotFindWalletFromUsernameError = exports.CouldNotListWalletsFromAccountIdError = exports.CouldNotFindWalletFromIdError = exports.CouldNotFindPhoneCodeError = exports.CouldNotFindUserFromWalletIdError = exports.CouldNotFindUserFromPhoneError = exports.CouldNotFindUserFromIdError = exports.CouldNotFindUserError = exports.CouldNotFindWalletInvoiceError = exports.DbConnectionClosedError = exports.CannotConnectToDbError = exports.CouldNotFindError = exports.BadInputsForFindError = exports.DuplicateError = exports.PersistError = exports.UnknownRepositoryError = exports.RepositoryError = exports.AuthorizationError = exports.InconsistentDataError = void 0;
exports.InvalidNonHodlInvoiceError = exports.InactiveAccountError = exports.InvalidAccountStatusError = exports.BadAmountForRouteError = exports.LnRouteValidationError = exports.TwoFALimitsExceededError = exports.TradeIntraAccountLimitsExceededError = exports.IntraledgerLimitsExceededError = exports.WithdrawalLimitsExceededError = exports.LimitsExceededError = exports.InvalidAccountLevelError = exports.InvalidLanguageError = exports.InvalidIPMetadataForRewardError = exports.InvalidIPMetadataASNError = exports.InvalidIPMetadataCountryError = exports.InvalidIPMetadataProxyError = exports.MissingIPMetadataError = exports.InvalidPhoneMetadataForRewardError = exports.InvalidPhoneMetadataCountryError = exports.InvalidPhoneMetadataTypeError = exports.MissingPhoneMetadataError = exports.InvalidQuizQuestionIdError = exports.RebalanceNeededError = exports.NoBtcWalletExistsForAccountError = exports.NoWalletExistsForUserError = exports.NoContactForUsernameError = exports.InvalidTargetConfirmations = exports.BalanceLessThanZeroError = exports.InvalidCurrencyForWalletError = exports.InsufficientBalanceError = exports.LessThanDustThresholdError = exports.SelfPaymentError = exports.AlreadyPaidError = exports.InvalidLedgerTransactionStateError = exports.InvalidLedgerTransactionId = exports.InvalidWalletId = exports.InvalidEmailAddress = exports.InvalidKratosUserId = exports.InvalidPhoneNumber = exports.InvalidBusinessTitleLengthError = exports.InvalidCoordinatesError = void 0;
const shared_1 = require("./shared");
class InconsistentDataError extends shared_1.DomainError {
}
exports.InconsistentDataError = InconsistentDataError;
class AuthorizationError extends shared_1.DomainError {
}
exports.AuthorizationError = AuthorizationError;
class RepositoryError extends shared_1.DomainError {
}
exports.RepositoryError = RepositoryError;
class UnknownRepositoryError extends RepositoryError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownRepositoryError = UnknownRepositoryError;
class PersistError extends RepositoryError {
}
exports.PersistError = PersistError;
class DuplicateError extends RepositoryError {
}
exports.DuplicateError = DuplicateError;
class BadInputsForFindError extends RepositoryError {
}
exports.BadInputsForFindError = BadInputsForFindError;
class CouldNotFindError extends RepositoryError {
}
exports.CouldNotFindError = CouldNotFindError;
class CannotConnectToDbError extends RepositoryError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.CannotConnectToDbError = CannotConnectToDbError;
class DbConnectionClosedError extends RepositoryError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.DbConnectionClosedError = DbConnectionClosedError;
class CouldNotFindWalletInvoiceError extends CouldNotFindError {
}
exports.CouldNotFindWalletInvoiceError = CouldNotFindWalletInvoiceError;
class CouldNotFindUserError extends CouldNotFindError {
}
exports.CouldNotFindUserError = CouldNotFindUserError;
class CouldNotFindUserFromIdError extends CouldNotFindError {
}
exports.CouldNotFindUserFromIdError = CouldNotFindUserFromIdError;
class CouldNotFindUserFromPhoneError extends CouldNotFindError {
}
exports.CouldNotFindUserFromPhoneError = CouldNotFindUserFromPhoneError;
class CouldNotFindUserFromWalletIdError extends CouldNotFindError {
}
exports.CouldNotFindUserFromWalletIdError = CouldNotFindUserFromWalletIdError;
class CouldNotFindPhoneCodeError extends CouldNotFindError {
}
exports.CouldNotFindPhoneCodeError = CouldNotFindPhoneCodeError;
class CouldNotFindWalletFromIdError extends CouldNotFindError {
}
exports.CouldNotFindWalletFromIdError = CouldNotFindWalletFromIdError;
class CouldNotListWalletsFromAccountIdError extends CouldNotFindError {
}
exports.CouldNotListWalletsFromAccountIdError = CouldNotListWalletsFromAccountIdError;
class CouldNotFindWalletFromUsernameError extends CouldNotFindError {
}
exports.CouldNotFindWalletFromUsernameError = CouldNotFindWalletFromUsernameError;
class CouldNotFindWalletFromUsernameAndCurrencyError extends CouldNotFindError {
}
exports.CouldNotFindWalletFromUsernameAndCurrencyError = CouldNotFindWalletFromUsernameAndCurrencyError;
class CouldNotFindWalletFromOnChainAddressError extends CouldNotFindError {
}
exports.CouldNotFindWalletFromOnChainAddressError = CouldNotFindWalletFromOnChainAddressError;
class CouldNotFindWalletFromOnChainAddressesError extends CouldNotFindError {
}
exports.CouldNotFindWalletFromOnChainAddressesError = CouldNotFindWalletFromOnChainAddressesError;
class CouldNotListWalletsFromWalletCurrencyError extends CouldNotFindError {
}
exports.CouldNotListWalletsFromWalletCurrencyError = CouldNotListWalletsFromWalletCurrencyError;
class NoTransactionToUpdateError extends CouldNotFindError {
}
exports.NoTransactionToUpdateError = NoTransactionToUpdateError;
class CouldNotFindLightningPaymentFlowError extends CouldNotFindError {
}
exports.CouldNotFindLightningPaymentFlowError = CouldNotFindLightningPaymentFlowError;
class CouldNotUpdateLightningPaymentFlowError extends CouldNotFindError {
}
exports.CouldNotUpdateLightningPaymentFlowError = CouldNotUpdateLightningPaymentFlowError;
class NoExpiredLightningPaymentFlowsError extends CouldNotFindError {
}
exports.NoExpiredLightningPaymentFlowsError = NoExpiredLightningPaymentFlowsError;
class CouldNotFindBtcWalletForAccountError extends CouldNotFindError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.CouldNotFindBtcWalletForAccountError = CouldNotFindBtcWalletForAccountError;
class CouldNotFindLnPaymentFromHashError extends CouldNotFindError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.CouldNotFindLnPaymentFromHashError = CouldNotFindLnPaymentFromHashError;
class CouldNotFindAccountFromUsernameError extends CouldNotFindError {
}
exports.CouldNotFindAccountFromUsernameError = CouldNotFindAccountFromUsernameError;
class CouldNotFindAccountFromPhoneError extends CouldNotFindError {
}
exports.CouldNotFindAccountFromPhoneError = CouldNotFindAccountFromPhoneError;
class CouldNotFindTransactionsForAccountError extends CouldNotFindError {
}
exports.CouldNotFindTransactionsForAccountError = CouldNotFindTransactionsForAccountError;
class CouldNotFindAccountFromKratosIdError extends CouldNotFindError {
}
exports.CouldNotFindAccountFromKratosIdError = CouldNotFindAccountFromKratosIdError;
class RewardAlreadyPresentError extends shared_1.DomainError {
}
exports.RewardAlreadyPresentError = RewardAlreadyPresentError;
class NotImplementedError extends shared_1.DomainError {
}
exports.NotImplementedError = NotImplementedError;
class NotReachableError extends shared_1.DomainError {
}
exports.NotReachableError = NotReachableError;
class InvalidNegativeAmountError extends shared_1.DomainError {
}
exports.InvalidNegativeAmountError = InvalidNegativeAmountError;
class MissingPhoneError extends shared_1.DomainError {
}
exports.MissingPhoneError = MissingPhoneError;
class ContactNotExistentError extends shared_1.DomainError {
}
exports.ContactNotExistentError = ContactNotExistentError;
class InvalidWithdrawFeeError extends shared_1.ValidationError {
}
exports.InvalidWithdrawFeeError = InvalidWithdrawFeeError;
class InvalidCurrencyBaseAmountError extends shared_1.ValidationError {
}
exports.InvalidCurrencyBaseAmountError = InvalidCurrencyBaseAmountError;
class InvalidSatoshiAmountError extends shared_1.ValidationError {
}
exports.InvalidSatoshiAmountError = InvalidSatoshiAmountError;
class InvalidUsdCents extends shared_1.ValidationError {
}
exports.InvalidUsdCents = InvalidUsdCents;
class NonIntegerError extends shared_1.ValidationError {
}
exports.NonIntegerError = NonIntegerError;
class InvalidOnChainAddress extends shared_1.ValidationError {
}
exports.InvalidOnChainAddress = InvalidOnChainAddress;
class InvalidPubKeyError extends shared_1.ValidationError {
}
exports.InvalidPubKeyError = InvalidPubKeyError;
class InvalidScanDepthAmount extends shared_1.ValidationError {
}
exports.InvalidScanDepthAmount = InvalidScanDepthAmount;
class SatoshiAmountRequiredError extends shared_1.ValidationError {
}
exports.SatoshiAmountRequiredError = SatoshiAmountRequiredError;
class InvalidUsername extends shared_1.ValidationError {
}
exports.InvalidUsername = InvalidUsername;
class InvalidContactAlias extends shared_1.ValidationError {
}
exports.InvalidContactAlias = InvalidContactAlias;
class InvalidCoordinatesError extends shared_1.ValidationError {
}
exports.InvalidCoordinatesError = InvalidCoordinatesError;
class InvalidBusinessTitleLengthError extends shared_1.ValidationError {
}
exports.InvalidBusinessTitleLengthError = InvalidBusinessTitleLengthError;
class InvalidPhoneNumber extends shared_1.ValidationError {
}
exports.InvalidPhoneNumber = InvalidPhoneNumber;
class InvalidKratosUserId extends shared_1.ValidationError {
}
exports.InvalidKratosUserId = InvalidKratosUserId;
class InvalidEmailAddress extends shared_1.ValidationError {
}
exports.InvalidEmailAddress = InvalidEmailAddress;
class InvalidWalletId extends shared_1.ValidationError {
}
exports.InvalidWalletId = InvalidWalletId;
class InvalidLedgerTransactionId extends shared_1.ValidationError {
}
exports.InvalidLedgerTransactionId = InvalidLedgerTransactionId;
class InvalidLedgerTransactionStateError extends shared_1.ValidationError {
}
exports.InvalidLedgerTransactionStateError = InvalidLedgerTransactionStateError;
class AlreadyPaidError extends shared_1.ValidationError {
}
exports.AlreadyPaidError = AlreadyPaidError;
class SelfPaymentError extends shared_1.ValidationError {
}
exports.SelfPaymentError = SelfPaymentError;
class LessThanDustThresholdError extends shared_1.ValidationError {
}
exports.LessThanDustThresholdError = LessThanDustThresholdError;
class InsufficientBalanceError extends shared_1.ValidationError {
}
exports.InsufficientBalanceError = InsufficientBalanceError;
class InvalidCurrencyForWalletError extends shared_1.ValidationError {
}
exports.InvalidCurrencyForWalletError = InvalidCurrencyForWalletError;
class BalanceLessThanZeroError extends shared_1.ValidationError {
}
exports.BalanceLessThanZeroError = BalanceLessThanZeroError;
class InvalidTargetConfirmations extends shared_1.ValidationError {
}
exports.InvalidTargetConfirmations = InvalidTargetConfirmations;
class NoContactForUsernameError extends shared_1.ValidationError {
}
exports.NoContactForUsernameError = NoContactForUsernameError;
class NoWalletExistsForUserError extends shared_1.ValidationError {
}
exports.NoWalletExistsForUserError = NoWalletExistsForUserError;
class NoBtcWalletExistsForAccountError extends shared_1.ValidationError {
}
exports.NoBtcWalletExistsForAccountError = NoBtcWalletExistsForAccountError;
class RebalanceNeededError extends shared_1.ValidationError {
}
exports.RebalanceNeededError = RebalanceNeededError;
class InvalidQuizQuestionIdError extends shared_1.ValidationError {
}
exports.InvalidQuizQuestionIdError = InvalidQuizQuestionIdError;
class MissingPhoneMetadataError extends shared_1.ValidationError {
}
exports.MissingPhoneMetadataError = MissingPhoneMetadataError;
class InvalidPhoneMetadataTypeError extends shared_1.ValidationError {
}
exports.InvalidPhoneMetadataTypeError = InvalidPhoneMetadataTypeError;
class InvalidPhoneMetadataCountryError extends shared_1.ValidationError {
}
exports.InvalidPhoneMetadataCountryError = InvalidPhoneMetadataCountryError;
class InvalidPhoneMetadataForRewardError extends shared_1.ValidationError {
}
exports.InvalidPhoneMetadataForRewardError = InvalidPhoneMetadataForRewardError;
class MissingIPMetadataError extends shared_1.ValidationError {
}
exports.MissingIPMetadataError = MissingIPMetadataError;
class InvalidIPMetadataProxyError extends shared_1.ValidationError {
}
exports.InvalidIPMetadataProxyError = InvalidIPMetadataProxyError;
class InvalidIPMetadataCountryError extends shared_1.ValidationError {
}
exports.InvalidIPMetadataCountryError = InvalidIPMetadataCountryError;
class InvalidIPMetadataASNError extends shared_1.ValidationError {
}
exports.InvalidIPMetadataASNError = InvalidIPMetadataASNError;
class InvalidIPMetadataForRewardError extends shared_1.ValidationError {
}
exports.InvalidIPMetadataForRewardError = InvalidIPMetadataForRewardError;
class InvalidLanguageError extends shared_1.ValidationError {
}
exports.InvalidLanguageError = InvalidLanguageError;
class InvalidAccountLevelError extends shared_1.ValidationError {
}
exports.InvalidAccountLevelError = InvalidAccountLevelError;
class LimitsExceededError extends shared_1.ValidationError {
}
exports.LimitsExceededError = LimitsExceededError;
class WithdrawalLimitsExceededError extends LimitsExceededError {
}
exports.WithdrawalLimitsExceededError = WithdrawalLimitsExceededError;
class IntraledgerLimitsExceededError extends LimitsExceededError {
}
exports.IntraledgerLimitsExceededError = IntraledgerLimitsExceededError;
class TradeIntraAccountLimitsExceededError extends LimitsExceededError {
}
exports.TradeIntraAccountLimitsExceededError = TradeIntraAccountLimitsExceededError;
class TwoFALimitsExceededError extends LimitsExceededError {
}
exports.TwoFALimitsExceededError = TwoFALimitsExceededError;
class LnRouteValidationError extends shared_1.ValidationError {
}
exports.LnRouteValidationError = LnRouteValidationError;
class BadAmountForRouteError extends LnRouteValidationError {
}
exports.BadAmountForRouteError = BadAmountForRouteError;
class InvalidAccountStatusError extends shared_1.ValidationError {
}
exports.InvalidAccountStatusError = InvalidAccountStatusError;
class InactiveAccountError extends InvalidAccountStatusError {
}
exports.InactiveAccountError = InactiveAccountError;
class InvalidNonHodlInvoiceError extends shared_1.ValidationError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.InvalidNonHodlInvoiceError = InvalidNonHodlInvoiceError;
//# sourceMappingURL=errors.js.map