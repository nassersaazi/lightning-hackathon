"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletIdMiddleware = void 0;
const _app_1 = require("../../app/index");
const error_map_1 = require("../../graphql/error-map");
const validateWalletId = async (resolve, parent, args, context, info) => {
    const { walletId } = args.input || args || {};
    if (!walletId)
        return new Error("Invalid wallet");
    if (walletId instanceof Error)
        return walletId;
    if (!context.domainAccount) {
        return new Error("Invalid Account");
    }
    const hasPermissions = await _app_1.Accounts.hasPermissions(context.domainAccount.id, walletId);
    if (hasPermissions instanceof Error)
        return (0, error_map_1.mapError)(hasPermissions);
    if (!hasPermissions)
        return new Error("Invalid wallet");
    return resolve(parent, args, context, info);
};
const validateWalletIdQuery = async (resolve, parent, args, context, info) => {
    const result = await validateWalletId(resolve, parent, args, context, info);
    if (result instanceof Error)
        throw result;
    return result;
};
const validateWalletIdMutation = async (resolve, parent, args, context, info) => {
    const result = await validateWalletId(resolve, parent, args, context, info);
    if (result instanceof Error)
        return { errors: [{ message: result.message }] };
    return result;
};
exports.walletIdMiddleware = {
    Query: {
        onChainTxFee: validateWalletIdQuery,
    },
    Mutation: {
        intraLedgerPaymentSend: validateWalletIdMutation,
        lnInvoiceFeeProbe: validateWalletIdMutation,
        lnNoAmountInvoiceFeeProbe: validateWalletIdMutation,
        lnInvoiceCreate: validateWalletIdMutation,
        lnUsdInvoiceCreate: validateWalletIdMutation,
        lnNoAmountInvoiceCreate: validateWalletIdMutation,
        lnInvoicePaymentSend: validateWalletIdMutation,
        lnNoAmountInvoicePaymentSend: validateWalletIdMutation,
        lnNoAmountUsdInvoicePaymentSend: validateWalletIdMutation,
        onChainAddressCreate: validateWalletIdMutation,
        onChainAddressCurrent: validateWalletIdMutation,
        onChainPaymentSend: validateWalletIdMutation,
        onChainPaymentSendAll: validateWalletIdMutation,
    },
};
//# sourceMappingURL=wallet-id.js.map