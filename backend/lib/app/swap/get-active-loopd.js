"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lnd2LoopConfig = exports.lnd1LoopConfig = exports.getActiveLoopd = void 0;
const utils_1 = require("../../services/lnd/utils");
const errors_1 = require("../../domain/swap/errors");
const _config_1 = require("../../config/index");
const getActiveLoopd = () => {
    const activeOffChainNode = (0, utils_1.getActiveLnd)();
    if (activeOffChainNode instanceof Error)
        throw errors_1.SwapErrorNoActiveLoopdNode;
    switch (activeOffChainNode.name) {
        case "LND1": {
            return (0, exports.lnd1LoopConfig)();
        }
        case "LND2": {
            return (0, exports.lnd2LoopConfig)();
        }
        default: {
            throw errors_1.SwapErrorNoActiveLoopdNode;
        }
    }
};
exports.getActiveLoopd = getActiveLoopd;
const lnd1LoopConfig = () => ({
    btcNetwork: _config_1.BTC_NETWORK,
    grpcEndpoint: (0, _config_1.getSwapConfig)().lnd1loopRpcEndpoint,
    tlsCert: (0, _config_1.getLoopConfig)().lnd1LoopTls,
    macaroon: (0, _config_1.getLoopConfig)().lnd1LoopMacaroon,
    lndInstanceName: "LND1",
});
exports.lnd1LoopConfig = lnd1LoopConfig;
const lnd2LoopConfig = () => ({
    btcNetwork: _config_1.BTC_NETWORK,
    grpcEndpoint: (0, _config_1.getSwapConfig)().lnd2loopRpcEndpoint,
    tlsCert: (0, _config_1.getLoopConfig)().lnd2LoopTls,
    macaroon: (0, _config_1.getLoopConfig)().lnd2LoopMacaroon,
    lndInstanceName: "LND2",
});
exports.lnd2LoopConfig = lnd2LoopConfig;
//# sourceMappingURL=get-active-loopd.js.map