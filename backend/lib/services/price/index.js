"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceService = void 0;
const util_1 = __importDefault(require("util"));
const grpc_js_1 = require("@grpc/grpc-js");
const price_1 = require("../../domain/price");
const bitcoin_1 = require("../../domain/bitcoin");
const logger_1 = require("../logger");
const grpc_1 = require("./grpc");
const priceUrl = process.env.PRICE_HOST ?? "galoy-price";
const pricePort = process.env.PRICE_PORT ?? "50051";
const fullUrl = `${priceUrl}:${pricePort}`;
const priceClient = new grpc_1.PriceProtoDescriptor.PriceFeed(fullUrl, grpc_js_1.credentials.createInsecure());
const getPrice = util_1.default.promisify(priceClient.getPrice).bind(priceClient);
const priceHistoryUrl = process.env.PRICE_HISTORY_HOST ?? "price-history";
const priceHistoryPort = process.env.PRICE_HISTORY_PORT ?? "50052";
const priceHistoryFullUrl = `${priceHistoryUrl}:${priceHistoryPort}`;
const priceHistoryClient = new grpc_1.PriceHistoryProtoDescriptor.PriceHistory(priceHistoryFullUrl, grpc_js_1.credentials.createInsecure());
const listPrices = util_1.default.promisify(priceHistoryClient.listPrices).bind(priceHistoryClient);
const PriceService = () => {
    const getRealTimePrice = async () => {
        try {
            const { price } = await getPrice({});
            // FIXME: price server should return CentsPerSat directly
            if (price > 0)
                return (price / bitcoin_1.SATS_PER_BTC);
            return new price_1.PriceNotAvailableError();
        }
        catch (err) {
            logger_1.baseLogger.error({ err }, "impossible to fetch most recent price");
            return new price_1.UnknownPriceServiceError(err);
        }
    };
    const listHistory = async ({ range, }) => {
        try {
            const { priceHistory } = await listPrices({ range });
            return priceHistory.map((t) => ({
                date: new Date(t.timestamp * 1000),
                price: t.price / bitcoin_1.SATS_PER_BTC,
            }));
        }
        catch (err) {
            return new price_1.UnknownPriceServiceError(err);
        }
    };
    return {
        getRealTimePrice,
        listHistory,
    };
};
exports.PriceService = PriceService;
//# sourceMappingURL=index.js.map