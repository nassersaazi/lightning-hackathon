"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const _config_1 = require("../../../config/index");
const index_1 = require("../../index");
const price_1 = __importDefault(require("../../types/payload/price"));
const sat_amount_1 = __importDefault(require("../../types/scalar/sat-amount"));
const exchange_currency_unit_1 = __importDefault(require("../../types/scalar/exchange-currency-unit"));
const error_1 = require("../../error");
const _app_1 = require("../../../app/index");
const pubsub_1 = require("../../../services/pubsub");
const logger_1 = require("../../../services/logger");
const pubsub_2 = require("../../../domain/pubsub");
const pubsub = (0, pubsub_1.PubSubService)();
const PriceInput = index_1.GT.Input({
    name: "PriceInput",
    fields: () => ({
        amount: { type: index_1.GT.NonNull(sat_amount_1.default) },
        amountCurrencyUnit: { type: index_1.GT.NonNull(exchange_currency_unit_1.default) },
        priceCurrencyUnit: { type: index_1.GT.NonNull(exchange_currency_unit_1.default) },
    }),
});
const PriceSubscription = {
    type: index_1.GT.NonNull(price_1.default),
    args: {
        input: { type: index_1.GT.NonNull(PriceInput) },
    },
    resolve: (source, args) => {
        if (source === undefined) {
            throw new error_1.UnknownClientError({
                message: "Got 'undefined' payload. Check url used to ensure right websocket endpoint was used for subscription.",
                level: "fatal",
                logger: logger_1.baseLogger,
            });
        }
        if (source.errors) {
            return { errors: source.errors };
        }
        if (!source.satUsdCentPrice) {
            return { errors: [{ message: "No price info" }] };
        }
        const amountPriceInCents = args.input.amount * source.satUsdCentPrice;
        return {
            errors: [],
            price: {
                formattedAmount: amountPriceInCents.toString(),
                base: Math.round(amountPriceInCents * 10 ** _config_1.SAT_PRICE_PRECISION_OFFSET),
                offset: _config_1.SAT_PRICE_PRECISION_OFFSET,
                currencyUnit: "USDCENT",
            },
        };
    },
    subscribe: async (_, args) => {
        const { amount, amountCurrencyUnit, priceCurrencyUnit } = args.input;
        const immediateTrigger = (0, pubsub_2.customPubSubTrigger)({
            event: pubsub_2.PubSubDefaultTriggers.PriceUpdate,
            suffix: crypto_1.default.randomUUID(),
        });
        for (const input of [amountCurrencyUnit, priceCurrencyUnit]) {
            if (input instanceof Error) {
                pubsub.publishImmediate({
                    trigger: immediateTrigger,
                    payload: { errors: [{ message: input.message }] },
                });
                return pubsub.createAsyncIterator({ trigger: immediateTrigger });
            }
        }
        if (amountCurrencyUnit !== "BTCSAT" || priceCurrencyUnit !== "USDCENT") {
            // For now, keep the only supported exchange price as SAT -> USD
            pubsub.publishImmediate({
                trigger: immediateTrigger,
                payload: { errors: [{ message: "Unsupported exchange unit" }] },
            });
        }
        else if (amount >= 1000000) {
            // SafeInt limit, reject for now
            pubsub.publishImmediate({
                trigger: immediateTrigger,
                payload: { errors: [{ message: "Unsupported exchange amount" }] },
            });
        }
        else {
            const satUsdPrice = await _app_1.Prices.getCurrentPrice();
            if (!(satUsdPrice instanceof Error)) {
                pubsub.publishImmediate({
                    trigger: immediateTrigger,
                    payload: { satUsdCentPrice: 100 * satUsdPrice },
                });
            }
            return pubsub.createAsyncIterator({
                trigger: [immediateTrigger, pubsub_2.PubSubDefaultTriggers.PriceUpdate],
            });
        }
        return pubsub.createAsyncIterator({ trigger: immediateTrigger });
    },
};
exports.default = PriceSubscription;
//# sourceMappingURL=price.js.map