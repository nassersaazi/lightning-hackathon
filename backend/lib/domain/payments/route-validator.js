"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteValidator = void 0;
const errors_1 = require("../errors");
const RouteValidator = (rawRoute) => {
    const validate = (btcPaymentAmount) => {
        const rawTokens = Math.floor(parseInt(rawRoute.total_mtokens || "0", 10) / 1000);
        const amount = Number(btcPaymentAmount.amount);
        if (amount !== rawTokens) {
            return new errors_1.BadAmountForRouteError(`${amount} !== ${rawTokens}`);
        }
        return true;
    };
    return {
        validate,
    };
};
exports.RouteValidator = RouteValidator;
//# sourceMappingURL=route-validator.js.map