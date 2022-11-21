"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorruptLndDbError = exports.BadPaymentDataError = exports.UnknownRouteNotFoundError = exports.InvalidFeeProbeStateError = exports.TemporaryChannelFailureError = exports.PaymentInTransitionError = exports.ProbeForRouteTimedOutFromApplicationError = exports.ProbeForRouteTimedOutError = exports.PaymentAttemptsTimedOutError = exports.InvoiceExpiredOrBadPaymentHashError = exports.InsufficientBalanceForLnPaymentError = exports.InsufficientBalanceForRoutingError = exports.UnknownNextPeerError = exports.RouteNotFoundError = exports.PaymentNotFoundError = exports.NoValidNodeForPubkeyError = exports.OffChainServiceUnavailableError = exports.LnAlreadyPaidError = exports.LnPaymentPendingError = exports.InvoiceNotFoundError = exports.SecretDoesNotMatchAnyExistingHodlInvoiceError = exports.UnknownLightningServiceError = exports.CouldNotDecodeReturnedPaymentRequest = exports.LightningServiceError = exports.UnknownLnInvoiceDecodeError = exports.InvalidChecksumForLnInvoiceError = exports.LnInvoiceMissingPaymentSecretError = exports.LnInvoiceDecodeError = exports.LightningError = void 0;
const shared_1 = require("../../shared");
class LightningError extends shared_1.DomainError {
}
exports.LightningError = LightningError;
class LnInvoiceDecodeError extends LightningError {
}
exports.LnInvoiceDecodeError = LnInvoiceDecodeError;
class LnInvoiceMissingPaymentSecretError extends LnInvoiceDecodeError {
}
exports.LnInvoiceMissingPaymentSecretError = LnInvoiceMissingPaymentSecretError;
class InvalidChecksumForLnInvoiceError extends LnInvoiceDecodeError {
}
exports.InvalidChecksumForLnInvoiceError = InvalidChecksumForLnInvoiceError;
class UnknownLnInvoiceDecodeError extends LnInvoiceDecodeError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownLnInvoiceDecodeError = UnknownLnInvoiceDecodeError;
class LightningServiceError extends LightningError {
}
exports.LightningServiceError = LightningServiceError;
class CouldNotDecodeReturnedPaymentRequest extends LightningServiceError {
}
exports.CouldNotDecodeReturnedPaymentRequest = CouldNotDecodeReturnedPaymentRequest;
class UnknownLightningServiceError extends LightningServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownLightningServiceError = UnknownLightningServiceError;
class SecretDoesNotMatchAnyExistingHodlInvoiceError extends LightningServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.SecretDoesNotMatchAnyExistingHodlInvoiceError = SecretDoesNotMatchAnyExistingHodlInvoiceError;
class InvoiceNotFoundError extends LightningServiceError {
}
exports.InvoiceNotFoundError = InvoiceNotFoundError;
class LnPaymentPendingError extends LightningServiceError {
}
exports.LnPaymentPendingError = LnPaymentPendingError;
class LnAlreadyPaidError extends LightningServiceError {
}
exports.LnAlreadyPaidError = LnAlreadyPaidError;
class OffChainServiceUnavailableError extends LightningServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.OffChainServiceUnavailableError = OffChainServiceUnavailableError;
class NoValidNodeForPubkeyError extends LightningServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.NoValidNodeForPubkeyError = NoValidNodeForPubkeyError;
class PaymentNotFoundError extends LightningServiceError {
}
exports.PaymentNotFoundError = PaymentNotFoundError;
class RouteNotFoundError extends LightningServiceError {
}
exports.RouteNotFoundError = RouteNotFoundError;
class UnknownNextPeerError extends LightningServiceError {
}
exports.UnknownNextPeerError = UnknownNextPeerError;
class InsufficientBalanceForRoutingError extends LightningServiceError {
}
exports.InsufficientBalanceForRoutingError = InsufficientBalanceForRoutingError;
class InsufficientBalanceForLnPaymentError extends LightningServiceError {
}
exports.InsufficientBalanceForLnPaymentError = InsufficientBalanceForLnPaymentError;
class InvoiceExpiredOrBadPaymentHashError extends LightningServiceError {
}
exports.InvoiceExpiredOrBadPaymentHashError = InvoiceExpiredOrBadPaymentHashError;
class PaymentAttemptsTimedOutError extends LightningServiceError {
}
exports.PaymentAttemptsTimedOutError = PaymentAttemptsTimedOutError;
class ProbeForRouteTimedOutError extends LightningServiceError {
}
exports.ProbeForRouteTimedOutError = ProbeForRouteTimedOutError;
class ProbeForRouteTimedOutFromApplicationError extends LightningServiceError {
}
exports.ProbeForRouteTimedOutFromApplicationError = ProbeForRouteTimedOutFromApplicationError;
class PaymentInTransitionError extends LightningServiceError {
}
exports.PaymentInTransitionError = PaymentInTransitionError;
class TemporaryChannelFailureError extends LightningServiceError {
}
exports.TemporaryChannelFailureError = TemporaryChannelFailureError;
class InvalidFeeProbeStateError extends LightningServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.InvalidFeeProbeStateError = InvalidFeeProbeStateError;
class UnknownRouteNotFoundError extends LightningServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownRouteNotFoundError = UnknownRouteNotFoundError;
class BadPaymentDataError extends LightningServiceError {
}
exports.BadPaymentDataError = BadPaymentDataError;
class CorruptLndDbError extends LightningServiceError {
}
exports.CorruptLndDbError = CorruptLndDbError;
//# sourceMappingURL=errors.js.map