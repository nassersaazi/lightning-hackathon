"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidLightningPaymentFlowStateError = exports.InvalidLightningPaymentFlowBuilderStateError = exports.MissingPropsInTransactionForPaymentFlowError = exports.NonLnPaymentTransactionForPaymentFlowError = exports.SkipProbeForPubkeyError = exports.IntraLedgerHashPresentInLnFlowError = exports.LnHashPresentInIntraLedgerFlowError = exports.LnPaymentRequestInTransitError = exports.LnPaymentRequestZeroAmountRequiredError = exports.LnPaymentRequestNonZeroAmountRequiredError = exports.ZeroAmountForUsdRecipientError = exports.InvalidZeroAmountPriceRatioInputError = exports.InvalidUsdPaymentAmountError = exports.InvalidBtcPaymentAmountError = void 0;
const shared_1 = require("../shared");
class InvalidBtcPaymentAmountError extends shared_1.ValidationError {
}
exports.InvalidBtcPaymentAmountError = InvalidBtcPaymentAmountError;
class InvalidUsdPaymentAmountError extends shared_1.ValidationError {
}
exports.InvalidUsdPaymentAmountError = InvalidUsdPaymentAmountError;
class InvalidZeroAmountPriceRatioInputError extends shared_1.ValidationError {
}
exports.InvalidZeroAmountPriceRatioInputError = InvalidZeroAmountPriceRatioInputError;
class ZeroAmountForUsdRecipientError extends shared_1.ValidationError {
}
exports.ZeroAmountForUsdRecipientError = ZeroAmountForUsdRecipientError;
class LnPaymentRequestNonZeroAmountRequiredError extends shared_1.ValidationError {
}
exports.LnPaymentRequestNonZeroAmountRequiredError = LnPaymentRequestNonZeroAmountRequiredError;
class LnPaymentRequestZeroAmountRequiredError extends shared_1.ValidationError {
}
exports.LnPaymentRequestZeroAmountRequiredError = LnPaymentRequestZeroAmountRequiredError;
class LnPaymentRequestInTransitError extends shared_1.ValidationError {
}
exports.LnPaymentRequestInTransitError = LnPaymentRequestInTransitError;
class LnHashPresentInIntraLedgerFlowError extends shared_1.ValidationError {
}
exports.LnHashPresentInIntraLedgerFlowError = LnHashPresentInIntraLedgerFlowError;
class IntraLedgerHashPresentInLnFlowError extends shared_1.ValidationError {
}
exports.IntraLedgerHashPresentInLnFlowError = IntraLedgerHashPresentInLnFlowError;
class SkipProbeForPubkeyError extends shared_1.ValidationError {
}
exports.SkipProbeForPubkeyError = SkipProbeForPubkeyError;
class NonLnPaymentTransactionForPaymentFlowError extends shared_1.ValidationError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.NonLnPaymentTransactionForPaymentFlowError = NonLnPaymentTransactionForPaymentFlowError;
class MissingPropsInTransactionForPaymentFlowError extends shared_1.ValidationError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.MissingPropsInTransactionForPaymentFlowError = MissingPropsInTransactionForPaymentFlowError;
class InvalidLightningPaymentFlowBuilderStateError extends shared_1.ValidationError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.InvalidLightningPaymentFlowBuilderStateError = InvalidLightningPaymentFlowBuilderStateError;
class InvalidLightningPaymentFlowStateError extends shared_1.ValidationError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.InvalidLightningPaymentFlowStateError = InvalidLightningPaymentFlowStateError;
//# sourceMappingURL=errors.js.map