"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownSwapServiceError = exports.SwapErrorChannelBalanceTooLow = exports.SwapErrorHealthCheckFailed = exports.SwapErrorNoActiveLoopdNode = exports.SwapClientNotResponding = exports.SwapServiceError = exports.SwapTriggerError = exports.NoOutboundLiquidityForSwapError = exports.SwapError = void 0;
const shared_1 = require("../shared");
class SwapError extends shared_1.DomainError {
}
exports.SwapError = SwapError;
class NoOutboundLiquidityForSwapError extends shared_1.DomainError {
}
exports.NoOutboundLiquidityForSwapError = NoOutboundLiquidityForSwapError;
class SwapTriggerError extends SwapError {
}
exports.SwapTriggerError = SwapTriggerError;
class SwapServiceError extends SwapError {
}
exports.SwapServiceError = SwapServiceError;
class SwapClientNotResponding extends SwapServiceError {
}
exports.SwapClientNotResponding = SwapClientNotResponding;
class SwapErrorNoActiveLoopdNode extends SwapServiceError {
}
exports.SwapErrorNoActiveLoopdNode = SwapErrorNoActiveLoopdNode;
class SwapErrorHealthCheckFailed extends SwapServiceError {
}
exports.SwapErrorHealthCheckFailed = SwapErrorHealthCheckFailed;
class SwapErrorChannelBalanceTooLow extends SwapServiceError {
}
exports.SwapErrorChannelBalanceTooLow = SwapErrorChannelBalanceTooLow;
class UnknownSwapServiceError extends SwapServiceError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.UnknownSwapServiceError = UnknownSwapServiceError;
//# sourceMappingURL=errors.js.map