"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewDealerPriceService = exports.DealerPriceService = void 0;
const util_1 = __importDefault(require("util"));
const _config_1 = require("../../config/index");
const grpc_js_1 = require("@grpc/grpc-js");
const shared_1 = require("../../domain/shared");
const dealer_price_1 = require("../../domain/dealer-price");
const bitcoin_1 = require("../../domain/bitcoin");
const lightning_1 = require("../../domain/bitcoin/lightning");
const fiat_1 = require("../../domain/fiat");
const payments_1 = require("../../domain/payments");
const logger_1 = require("../logger");
const price_service_grpc_pb_1 = require("./proto/services/price/v1/price_service_grpc_pb");
const price_service_pb_1 = require("./proto/services/price/v1/price_service_pb");
const config = (0, _config_1.getDealerPriceConfig)();
const client = new price_service_grpc_pb_1.PriceServiceClient(`${config.host}:${config.port}`, grpc_js_1.credentials.createInsecure());
const clientGetCentsFromSatsForImmediateBuy = util_1.default.promisify(client.getCentsFromSatsForImmediateBuy.bind(client));
const clientGetCentsFromSatsForImmediateSell = util_1.default.promisify(client.getCentsFromSatsForImmediateSell.bind(client));
const clientGetCentsFromSatsForFutureBuy = util_1.default.promisify(client.getCentsFromSatsForFutureBuy.bind(client));
const clientGetCentsFromSatsForFutureSell = util_1.default.promisify(client.getCentsFromSatsForFutureSell.bind(client));
const clientGetSatsFromCentsForImmediateBuy = util_1.default.promisify(client.getSatsFromCentsForImmediateBuy.bind(client));
const clientGetSatsFromCentsForImmediateSell = util_1.default.promisify(client.getSatsFromCentsForImmediateSell.bind(client));
const clientGetSatsFromCentsForFutureBuy = util_1.default.promisify(client.getSatsFromCentsForFutureBuy.bind(client));
const clientGetSatsFromCentsForFutureSell = util_1.default.promisify(client.getSatsFromCentsForFutureSell.bind(client));
const clientGetCentsPerSatsExchangeMidRate = util_1.default.promisify(client.getCentsPerSatsExchangeMidRate.bind(client));
const DealerPriceService = () => {
    const getCentsFromSatsForImmediateBuy = async function (amountInSatoshis) {
        try {
            const response = await clientGetCentsFromSatsForImmediateBuy(new price_service_pb_1.GetCentsFromSatsForImmediateBuyRequest().setAmountInSatoshis(amountInSatoshis));
            return (0, fiat_1.toCents)(response.getAmountInCents());
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetCentsFromSatsForImmediateBuy unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getCentsFromSatsForImmediateSell = async function (amountInSatoshis) {
        try {
            const response = await clientGetCentsFromSatsForImmediateSell(new price_service_pb_1.GetCentsFromSatsForImmediateSellRequest().setAmountInSatoshis(amountInSatoshis));
            return (0, fiat_1.toCents)(response.getAmountInCents());
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetCentsFromSatsForImmediateSell unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getCentsFromSatsForFutureBuy = async function (amountInSatoshis, timeToExpiryInSeconds) {
        try {
            const response = await clientGetCentsFromSatsForFutureBuy(new price_service_pb_1.GetCentsFromSatsForFutureBuyRequest()
                .setAmountInSatoshis(amountInSatoshis)
                .setTimeInSeconds(timeToExpiryInSeconds));
            return (0, fiat_1.toCents)(response.getAmountInCents());
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetCentsFromSatsForFutureBuy unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getCentsFromSatsForFutureSell = async function (amountInSatoshis, timeToExpiryInSeconds) {
        try {
            const response = await clientGetCentsFromSatsForFutureSell(new price_service_pb_1.GetCentsFromSatsForFutureSellRequest()
                .setAmountInSatoshis(amountInSatoshis)
                .setTimeInSeconds(timeToExpiryInSeconds));
            return (0, fiat_1.toCents)(response.getAmountInCents());
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetCentsFromSatsForFutureSell unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getSatsFromCentsForImmediateBuy = async function (amountInCents) {
        try {
            const response = await clientGetSatsFromCentsForImmediateBuy(new price_service_pb_1.GetSatsFromCentsForImmediateBuyRequest().setAmountInCents(amountInCents));
            return (0, bitcoin_1.toSats)(response.getAmountInSatoshis());
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetSatsFromCentsForImmediateBuy unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getSatsFromCentsForImmediateSell = async function (amountInCents) {
        try {
            const response = await clientGetSatsFromCentsForImmediateSell(new price_service_pb_1.GetSatsFromCentsForImmediateSellRequest().setAmountInCents(amountInCents));
            return (0, bitcoin_1.toSats)(response.getAmountInSatoshis());
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetSatsFromCentsForImmediateSell unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getSatsFromCentsForFutureBuy = async function (amountInCents, timeToExpiryInSeconds) {
        try {
            const response = await clientGetSatsFromCentsForFutureBuy(new price_service_pb_1.GetSatsFromCentsForFutureBuyRequest()
                .setAmountInCents(amountInCents)
                .setTimeInSeconds(timeToExpiryInSeconds));
            return (0, bitcoin_1.toSats)(response.getAmountInSatoshis());
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetSatsFromCentsForFutureBuy unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getSatsFromCentsForFutureSell = async function (amountInCents, timeToExpiryInSeconds) {
        try {
            const response = await clientGetSatsFromCentsForFutureSell(new price_service_pb_1.GetSatsFromCentsForFutureSellRequest()
                .setAmountInCents(amountInCents)
                .setTimeInSeconds(timeToExpiryInSeconds));
            return (0, bitcoin_1.toSats)(response.getAmountInSatoshis());
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetSatsFromCentsForFutureSell unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getCentsPerSatsExchangeMidRate = async function () {
        try {
            const response = await clientGetCentsPerSatsExchangeMidRate(new price_service_pb_1.GetCentsPerSatsExchangeMidRateRequest());
            return (0, fiat_1.toCentsPerSatsRatio)(response.getRatioInCentsPerSatoshis());
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetCentsPerSatsExchangeMidRate unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    return {
        getCentsFromSatsForImmediateBuy,
        getCentsFromSatsForImmediateSell,
        getCentsFromSatsForFutureBuy,
        getCentsFromSatsForFutureSell,
        getSatsFromCentsForImmediateBuy,
        getSatsFromCentsForImmediateSell,
        getSatsFromCentsForFutureBuy,
        getSatsFromCentsForFutureSell,
        getCentsPerSatsExchangeMidRate,
    };
};
exports.DealerPriceService = DealerPriceService;
const NewDealerPriceService = (timeToExpiryInSeconds = lightning_1.defaultTimeToExpiryInSeconds) => {
    const getCentsFromSatsForImmediateBuy = async function (btcAmount) {
        try {
            const response = await clientGetCentsFromSatsForImmediateBuy(new price_service_pb_1.GetCentsFromSatsForImmediateBuyRequest().setAmountInSatoshis(Number(btcAmount.amount)));
            const amount = response.getAmountInCents();
            return (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Usd });
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetCentsFromSatsForImmediateBuy unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getCentsFromSatsForImmediateSell = async function (btcAmount) {
        try {
            const response = await clientGetCentsFromSatsForImmediateSell(new price_service_pb_1.GetCentsFromSatsForImmediateSellRequest().setAmountInSatoshis(Number(btcAmount.amount)));
            const amount = response.getAmountInCents();
            return (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Usd });
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetCentsFromSatsForImmediateSell unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getCentsFromSatsForFutureBuy = async function (btcAmount) {
        try {
            const response = await clientGetCentsFromSatsForFutureBuy(new price_service_pb_1.GetCentsFromSatsForFutureBuyRequest()
                .setAmountInSatoshis(Number(btcAmount.amount))
                .setTimeInSeconds(timeToExpiryInSeconds));
            const amount = response.getAmountInCents();
            return (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Usd });
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetCentsFromSatsForFutureBuy unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getCentsFromSatsForFutureSell = async function (btcAmount) {
        try {
            const response = await clientGetCentsFromSatsForFutureSell(new price_service_pb_1.GetCentsFromSatsForFutureSellRequest()
                .setAmountInSatoshis(Number(btcAmount.amount))
                .setTimeInSeconds(timeToExpiryInSeconds));
            const amount = response.getAmountInCents();
            return (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Usd });
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetCentsFromSatsForFutureSell unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getSatsFromCentsForImmediateBuy = async function (usdAmount) {
        try {
            const response = await clientGetSatsFromCentsForImmediateBuy(new price_service_pb_1.GetSatsFromCentsForImmediateBuyRequest().setAmountInCents(Number(usdAmount.amount)));
            const amount = response.getAmountInSatoshis();
            return (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Btc });
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetSatsFromCentsForImmediateBuy unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getSatsFromCentsForImmediateSell = async function (usdAmount) {
        try {
            const response = await clientGetSatsFromCentsForImmediateSell(new price_service_pb_1.GetSatsFromCentsForImmediateSellRequest().setAmountInCents(Number(usdAmount.amount)));
            const amount = response.getAmountInSatoshis();
            return (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Btc });
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetSatsFromCentsForImmediateSell unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getSatsFromCentsForFutureBuy = async function (usdAmount) {
        try {
            const response = await clientGetSatsFromCentsForFutureBuy(new price_service_pb_1.GetSatsFromCentsForFutureBuyRequest()
                .setAmountInCents(Number(usdAmount.amount))
                .setTimeInSeconds(timeToExpiryInSeconds));
            const amount = response.getAmountInSatoshis();
            return (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Btc });
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetSatsFromCentsForFutureBuy unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getSatsFromCentsForFutureSell = async function (usdAmount) {
        try {
            const response = await clientGetSatsFromCentsForFutureSell(new price_service_pb_1.GetSatsFromCentsForFutureSellRequest()
                .setAmountInCents(Number(usdAmount.amount))
                .setTimeInSeconds(timeToExpiryInSeconds));
            const amount = response.getAmountInSatoshis();
            return (0, shared_1.paymentAmountFromNumber)({ amount, currency: shared_1.WalletCurrency.Btc });
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetSatsFromCentsForFutureSell unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    const getCentsPerSatsExchangeMidRate = async function () {
        try {
            const response = await clientGetCentsPerSatsExchangeMidRate(new price_service_pb_1.GetCentsPerSatsExchangeMidRateRequest());
            return (0, payments_1.toPriceRatio)(response.getRatioInCentsPerSatoshis());
        }
        catch (error) {
            logger_1.baseLogger.error({ error }, "GetCentsPerSatsExchangeMidRate unable to fetch price");
            return parseDealerErrors(error);
        }
    };
    return {
        getCentsFromSatsForImmediateBuy,
        getCentsFromSatsForImmediateSell,
        getCentsFromSatsForFutureBuy,
        getCentsFromSatsForFutureSell,
        getSatsFromCentsForImmediateBuy,
        getSatsFromCentsForImmediateSell,
        getSatsFromCentsForFutureBuy,
        getSatsFromCentsForFutureSell,
        getCentsPerSatsExchangeMidRate,
    };
};
exports.NewDealerPriceService = NewDealerPriceService;
/* eslint @typescript-eslint/ban-ts-comment: "off" */
// @ts-ignore-next-line no-implicit-any error
const parseDealerErrors = (error) => {
    if (error.details === "No connection established") {
        return new dealer_price_1.NoConnectionToDealerError();
    }
    if (error.message.includes("StalePrice")) {
        return new dealer_price_1.DealerStalePriceError();
    }
    return new dealer_price_1.UnknownDealerPriceServiceError(error.message);
};
//# sourceMappingURL=dealer-price.js.map