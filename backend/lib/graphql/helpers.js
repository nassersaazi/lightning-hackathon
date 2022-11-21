"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notBtcWalletForQueryError = exports.validateIsUsdWalletForMutation = exports.validateIsBtcWalletForMutation = void 0;
const mongoose_1 = require("../services/mongoose");
const shared_1 = require("../domain/shared");
const error_map_1 = require("./error-map");
const QueryDoesNotMatchWalletCurrencyError = "QueryDoesNotMatchWalletCurrencyError";
const MutationDoesNotMatchWalletCurrencyError = "MutationDoesNotMatchWalletCurrencyError";
const validateIsBtcWalletForMutation = async (walletId) => {
    const wallet = await (0, mongoose_1.WalletsRepository)().findById(walletId);
    if (wallet instanceof Error)
        return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(wallet)] };
    if (wallet.currency === shared_1.WalletCurrency.Usd) {
        return { errors: [{ message: MutationDoesNotMatchWalletCurrencyError }] };
    }
    return true;
};
exports.validateIsBtcWalletForMutation = validateIsBtcWalletForMutation;
const validateIsUsdWalletForMutation = async (walletId) => {
    const wallet = await (0, mongoose_1.WalletsRepository)().findById(walletId);
    if (wallet instanceof Error)
        return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(wallet)] };
    if (wallet.currency === shared_1.WalletCurrency.Btc) {
        return { errors: [{ message: MutationDoesNotMatchWalletCurrencyError }] };
    }
    return true;
};
exports.validateIsUsdWalletForMutation = validateIsUsdWalletForMutation;
exports.notBtcWalletForQueryError = {
    errors: [{ message: QueryDoesNotMatchWalletCurrencyError }],
};
//# sourceMappingURL=helpers.js.map