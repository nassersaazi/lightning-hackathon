"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopService = void 0;
// https://lightning.engineering/loopapi/index.html#service-swapclient
const util_1 = __importDefault(require("util"));
const grpc = __importStar(require("@grpc/grpc-js"));
const errors_1 = require("../../domain/swap/errors");
const swap_1 = require("../../domain/swap");
const tracing_1 = require("../tracing");
const bitcoin_1 = require("../../domain/bitcoin");
const index_1 = require("../../domain/swap/index");
const shared_1 = require("../../domain/shared");
const loop_grpc_pb_1 = require("./protos/loop_grpc_pb");
const loop_pb_1 = require("./protos/loop_pb");
const LoopService = ({ macaroon, tlsCert, grpcEndpoint, btcNetwork, lndInstanceName, }) => {
    const mac = Buffer.from(macaroon, "base64").toString("hex");
    const tls = Buffer.from(tlsCert, "base64");
    const swapClient = createClient(mac, tls, grpcEndpoint);
    // helpers
    const clientHealthCheck = util_1.default.promisify(swapClient.getLsatTokens.bind(swapClient));
    const clientSwapOut = util_1.default.promisify(swapClient.loopOut.bind(swapClient));
    const clientSwapOutQuote = util_1.default.promisify(swapClient.loopOutQuote.bind(swapClient));
    const clientSwapOutTerms = util_1.default.promisify(swapClient.loopOutTerms.bind(swapClient));
    const healthCheck = async () => {
        try {
            const request = new loop_pb_1.TokensRequest();
            const resp = await clientHealthCheck(request);
            if (resp)
                return true;
        }
        catch (error) {
            return false;
        }
        return false;
    };
    const swapOut = async function ({ amount, maxSwapFee, swapDestAddress, }) {
        const fee = maxSwapFee ? Number(maxSwapFee.amount) : 20000;
        try {
            const request = new loop_pb_1.LoopOutRequest();
            // on regtest, set the publication deadline to 0 for faster swaps, otherwise
            // set it to 30 minutes in the future to reduce swap fees
            const thirtyMins = 30 * 60 * 1000;
            const swapPublicationDeadline = btcNetwork === bitcoin_1.BtcNetwork.regtest ? 0 : Date.now() + thirtyMins;
            if (swapDestAddress)
                request.setDest(swapDestAddress);
            request.setAmt(Number(amount.amount));
            request.setMaxSwapFee(fee);
            request.setMaxPrepayRoutingFee(fee);
            request.setMaxSwapFee(fee);
            request.setMaxPrepayAmt(fee);
            request.setMaxMinerFee(fee);
            request.setSwapPublicationDeadline(swapPublicationDeadline);
            request.setInitiator(`galoy-${lndInstanceName}`);
            if (btcNetwork === bitcoin_1.BtcNetwork.regtest)
                request.setHtlcConfirmations(1);
            if (btcNetwork === bitcoin_1.BtcNetwork.regtest)
                request.setSweepConfTarget(2);
            const resp = await clientSwapOut(request);
            const swapOutResult = {
                htlcAddress: resp.getHtlcAddress(),
                serverMessage: resp.getServerMessage(),
                swapId: resp.getId(),
                swapIdBytes: resp.getIdBytes().toString(),
            };
            return swapOutResult;
        }
        catch (error) {
            if (error.message.includes("channel balance too low")) {
                return new errors_1.SwapErrorChannelBalanceTooLow(error);
            }
            return new errors_1.SwapServiceError(error);
        }
    };
    const swapListener = function () {
        try {
            const request = new loop_pb_1.MonitorRequest();
            const listener = swapClient.monitor(request);
            listener.on("data", (data) => {
                listener.pause();
                // parse data to our interface
                const state = parseState(data.getState());
                const message = parseMessage(data.getFailureReason());
                const swapType = parseSwapType(data.getType());
                const parsedSwapData = {
                    id: data.getId(),
                    amt: BigInt(data.getAmt()),
                    htlcAddress: data.getHtlcAddress(),
                    offchainRoutingFee: BigInt(data.getCostOffchain()),
                    onchainMinerFee: BigInt(data.getCostOnchain()),
                    serviceProviderFee: BigInt(data.getCostServer()),
                    state: state,
                    message,
                    swapType,
                };
                data.parsedSwapData = parsedSwapData;
                listener.resume();
            });
            return listener;
        }
        catch (error) {
            throw new errors_1.UnknownSwapServiceError(error);
        }
    };
    const swapOutQuote = async (btcAmount) => {
        try {
            const request = new loop_pb_1.QuoteRequest();
            request.setAmt(Number(btcAmount.amount));
            const resp = await clientSwapOutQuote(request);
            return {
                cltvDelta: resp.getCltvDelta(),
                confTarget: resp.getConfTarget(),
                htlcSweepFeeSat: {
                    amount: BigInt(resp.getHtlcSweepFeeSat()),
                    currency: shared_1.WalletCurrency.Btc,
                },
                prepayAmtSat: {
                    amount: BigInt(resp.getPrepayAmtSat()),
                    currency: shared_1.WalletCurrency.Btc,
                },
                swapFeeSat: {
                    amount: BigInt(resp.getSwapFeeSat()),
                    currency: shared_1.WalletCurrency.Btc,
                },
                swapPaymentDest: resp.getSwapPaymentDest().toString(),
            };
        }
        catch (error) {
            return new errors_1.UnknownSwapServiceError(error);
        }
    };
    const swapOutTerms = async () => {
        try {
            const request = new loop_pb_1.TermsRequest();
            const resp = await clientSwapOutTerms(request);
            return {
                maxCltvDelta: resp.getMaxCltvDelta(),
                maxSwapAmount: {
                    amount: BigInt(resp.getMaxSwapAmount()),
                    currency: shared_1.WalletCurrency.Btc,
                },
                minCltvDelta: resp.getMinCltvDelta(),
                minSwapAmount: {
                    amount: BigInt(resp.getMinSwapAmount()),
                    currency: shared_1.WalletCurrency.Btc,
                },
            };
        }
        catch (error) {
            return new errors_1.UnknownSwapServiceError(error);
        }
    };
    function createClient(macaroon, tls, grpcEndpoint) {
        const grpcOptions = {
            "grpc.max_receive_message_length": -1,
            "grpc.max_send_message_length": -1,
        };
        const sslCreds = grpc.credentials.createSsl(tls);
        const metadata = new grpc.Metadata();
        metadata.add("macaroon", macaroon);
        const macaroonCreds = grpc.credentials.createFromMetadataGenerator((_args, callback) => {
            callback(null, metadata);
        });
        const credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
        try {
            const client = new loop_grpc_pb_1.SwapClientClient(grpcEndpoint, credentials, grpcOptions);
            return client;
        }
        catch (e) {
            throw new errors_1.SwapClientNotResponding(e);
        }
    }
    function parseState(state) {
        try {
            const parsedState = Object.keys(loop_pb_1.SwapState).find((key) => {
                // eslint-disable-next-line
                // @ts-ignore
                return loop_pb_1.SwapState[key] === state;
            });
            if (parsedState === "INITIATED")
                return index_1.SwapState.Initiated;
            if (parsedState === "SUCCESS")
                return index_1.SwapState.Success;
            if (parsedState === "PREIMAGE_REVEALED")
                return index_1.SwapState.PreimageRevealed;
            if (parsedState === "HTLC_PUBLISHED")
                return index_1.SwapState.HtlcPublished;
            if (parsedState === "INVOICE_SETTLED")
                return index_1.SwapState.Initiated;
            return index_1.SwapState.Failed;
        }
        catch (e) {
            return index_1.SwapState.Failed;
        }
    }
    function parseMessage(messageCode) {
        try {
            const parsedMessage = Object.keys(messageCode).find(
            // eslint-disable-next-line
            // @ts-ignore
            (key) => loop_pb_1.FailureReason[key] === messageCode);
            return parsedMessage ?? "";
        }
        catch (e) {
            return "";
        }
    }
    function parseSwapType(swapType) {
        try {
            if (swapType === 0)
                return swap_1.SwapType.Swapout;
            return swap_1.SwapType.Unknown;
        }
        catch (e) {
            return swap_1.SwapType.Unknown;
        }
    }
    return (0, tracing_1.wrapAsyncFunctionsToRunInSpan)({
        namespace: "services.swap",
        fns: {
            healthCheck,
            swapOut,
            swapListener,
            swapOutQuote,
            swapOutTerms,
        },
    });
};
exports.LoopService = LoopService;
//# sourceMappingURL=loop-service.js.map