"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebalancingInternalChannels = exports.reconnectNodes = void 0;
const fs_1 = require("fs");
const logger_1 = require("../logger");
const lightning_1 = require("lightning");
const network_1 = require("balanceofsatoshis/network");
const commands_1 = require("balanceofsatoshis/commands");
const utils_1 = require("./utils");
const _1 = require(".");
const reconnectNodes = async () => {
    const lndService = (0, _1.LndService)();
    if (lndService instanceof Error)
        throw lndService;
    const lndsParamsAuth = (0, utils_1.getLnds)({ type: "offchain", active: true });
    for (const lndParamsAuth of lndsParamsAuth) {
        const { lnd } = lndParamsAuth;
        await (0, network_1.reconnect)({ lnd });
    }
};
exports.reconnectNodes = reconnectNodes;
const rebalancingInternalChannels = async () => {
    const lndService = (0, _1.LndService)();
    if (lndService instanceof Error)
        throw lndService;
    const lndsParamsAuth = (0, utils_1.getLnds)({ type: "offchain", active: true });
    if (lndsParamsAuth.length !== 2) {
        // TODO: rebalancing algo for more than 2 internal nodes
        logger_1.baseLogger.warn("rebalancing needs 2 active internal nodes");
        return;
    }
    const selfLnd = lndsParamsAuth[0].lnd;
    const otherLnd = lndsParamsAuth[1].lnd;
    const selfPubkey = lndsParamsAuth[0].pubkey;
    const otherPubkey = lndsParamsAuth[1].pubkey;
    const { channels } = await getDirectChannels({ lnd: selfLnd, otherPubkey });
    if (channels.length === 0) {
        logger_1.baseLogger.warn("need at least one active channel to rebalance");
        return;
    }
    // TODO:
    // we currently only rebalancing the biggest channel between both peers.
    // we need to be able to specify the channel for when we have many direct channels
    // but pushPayment doesn't take a channelId currently
    const largestChannel = [channels.sort((a, b) => (a.capacity > b.capacity ? -1 : 1))[0]];
    for (const channel of largestChannel) {
        const diff = channel.capacity / 2 /* half point */ - channel.local_balance;
        const settings = {
            avoid: [],
            fs: { getFile: fs_1.readFile },
            logger: logger_1.baseLogger /* expecting winston logger but pino should be api compatible */,
            max_fee: 0,
            quiz_answers: [],
            request: commands_1.simpleRequest,
            amount: String(Math.abs(diff)),
        };
        if (diff > 0) {
            // there is more liquidity on the other node
            await (0, network_1.pushPayment)({
                lnd: otherLnd,
                destination: selfPubkey,
                ...settings,
            });
        }
        else if (diff < 0) {
            // there is more liquidity on the local node
            await (0, network_1.pushPayment)({
                lnd: selfLnd,
                destination: otherPubkey,
                ...settings,
            });
        }
        else {
            logger_1.baseLogger.info("no rebalancing needed");
        }
    }
};
exports.rebalancingInternalChannels = rebalancingInternalChannels;
const getDirectChannels = async ({ lnd, otherPubkey, }) => (0, lightning_1.getChannels)({ lnd, partner_public_key: otherPubkey });
//# sourceMappingURL=utils-bos.js.map