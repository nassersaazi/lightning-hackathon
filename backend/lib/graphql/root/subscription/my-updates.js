"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _config_1 = require("../../../config/index");
const index_1 = require("../../index");
const price_1 = __importDefault(require("../../types/object/price"));
const error_1 = __importDefault(require("../../types/abstract/error"));
const wallet_id_1 = __importDefault(require("../../types/scalar/wallet-id"));
const sat_amount_1 = __importDefault(require("../../types/scalar/sat-amount"));
const graphql_user_1 = __importDefault(require("../../types/object/graphql-user"));
const payment_hash_1 = __importDefault(require("../../types/scalar/payment-hash"));
const onchain_tx_hash_1 = __importDefault(require("../../types/scalar/onchain-tx-hash"));
const tx_notification_type_1 = __importDefault(require("../../types/scalar/tx-notification-type"));
const invoice_payment_status_1 = __importDefault(require("../../types/scalar/invoice-payment-status"));
const _app_1 = require("../../../app/index");
const pubsub_1 = require("../../../services/pubsub");
const pubsub_2 = require("../../../domain/pubsub");
const error_2 = require("../../error");
const logger_1 = require("../../../services/logger");
const pubsub = (0, pubsub_1.PubSubService)();
const IntraLedgerUpdate = index_1.GT.Object({
    name: "IntraLedgerUpdate",
    fields: () => ({
        txNotificationType: { type: index_1.GT.NonNull(tx_notification_type_1.default) },
        amount: { type: index_1.GT.NonNull(sat_amount_1.default) },
        displayCurrencyPerSat: { type: index_1.GT.NonNull(index_1.GT.Float) },
        usdPerSat: {
            type: index_1.GT.NonNull(index_1.GT.Float),
            deprecationReason: "updated over displayCurrencyPerSat",
        },
        walletId: { type: index_1.GT.NonNull(wallet_id_1.default) },
    }),
});
const LnUpdate = index_1.GT.Object({
    name: "LnUpdate",
    fields: () => ({
        paymentHash: { type: index_1.GT.NonNull(payment_hash_1.default) },
        status: { type: index_1.GT.NonNull(invoice_payment_status_1.default) },
        walletId: { type: index_1.GT.NonNull(wallet_id_1.default) },
    }),
});
const OnChainUpdate = index_1.GT.Object({
    name: "OnChainUpdate",
    fields: () => ({
        txNotificationType: { type: index_1.GT.NonNull(tx_notification_type_1.default) },
        txHash: { type: index_1.GT.NonNull(onchain_tx_hash_1.default) },
        amount: { type: index_1.GT.NonNull(sat_amount_1.default) },
        displayCurrencyPerSat: { type: index_1.GT.NonNull(index_1.GT.Float) },
        usdPerSat: {
            type: index_1.GT.NonNull(index_1.GT.Float),
            deprecationReason: "updated over displayCurrencyPerSat",
        },
        walletId: { type: index_1.GT.NonNull(wallet_id_1.default) },
    }),
});
const UserUpdate = index_1.GT.Union({
    name: "UserUpdate",
    types: [price_1.default, LnUpdate, OnChainUpdate, IntraLedgerUpdate],
    resolveType: (obj) => obj.resolveType,
});
const MyUpdatesPayload = index_1.GT.Object({
    name: "MyUpdatesPayload",
    fields: () => ({
        errors: { type: index_1.GT.NonNullList(error_1.default) },
        update: { type: UserUpdate },
        me: { type: graphql_user_1.default },
    }),
});
const userPayload = (domainUser) => (updateData) => ({
    errors: [],
    me: domainUser,
    update: updateData,
});
const MeSubscription = {
    type: index_1.GT.NonNull(MyUpdatesPayload),
    resolve: (source, _args, ctx) => {
        if (!ctx.domainUser) {
            throw new error_2.AuthenticationError({
                message: "Not Authenticated for subscription",
                logger: logger_1.baseLogger,
            });
        }
        if (source === undefined) {
            throw new error_2.UnknownClientError({
                message: "Got 'undefined' payload. Check url used to ensure right websocket endpoint was used for subscription.",
                level: "fatal",
                logger: logger_1.baseLogger,
            });
        }
        if (source.errors) {
            return { errors: source.errors };
        }
        const myPayload = userPayload(ctx.domainUser);
        if (source.price) {
            return userPayload(null)({
                resolveType: "Price",
                base: Math.round(source.price.satUsdCentPrice * 10 ** _config_1.SAT_PRICE_PRECISION_OFFSET),
                offset: _config_1.SAT_PRICE_PRECISION_OFFSET,
                currencyUnit: "USDCENT",
                formattedAmount: source.price.satUsdCentPrice.toString(),
            });
        }
        if (source.invoice) {
            return myPayload({ resolveType: "LnUpdate", ...source.invoice });
        }
        if (source.transaction) {
            return myPayload({
                resolveType: "OnChainUpdate",
                usdPerSat: source.transaction.displayCurrencyPerSat,
                ...source.transaction,
            });
        }
        if (source.intraLedger) {
            return myPayload({
                resolveType: "IntraLedgerUpdate",
                usdPerSat: source.intraLedger.displayCurrencyPerSat,
                ...source.intraLedger,
            });
        }
    },
    subscribe: async (_source, _args, ctx) => {
        if (!ctx.domainUser) {
            throw new error_2.AuthenticationError({
                message: "Not Authenticated for subscription",
                logger: logger_1.baseLogger,
            });
        }
        const accountUpdatedTrigger = (0, pubsub_2.customPubSubTrigger)({
            event: pubsub_2.PubSubDefaultTriggers.AccountUpdate,
            suffix: ctx.domainAccount.id,
        });
        const satUsdPrice = await _app_1.Prices.getCurrentPrice();
        if (!(satUsdPrice instanceof Error)) {
            pubsub.publishImmediate({
                trigger: accountUpdatedTrigger,
                payload: { price: { satUsdCentPrice: 100 * satUsdPrice } },
            });
        }
        return pubsub.createAsyncIterator({
            trigger: [accountUpdatedTrigger, pubsub_2.PubSubDefaultTriggers.UserPriceUpdate],
        });
    },
};
exports.default = MeSubscription;
//# sourceMappingURL=my-updates.js.map