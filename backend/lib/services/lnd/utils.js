"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLndErrorDetails = exports.getLndFromPubkey = exports.nodesPubKey = exports.onchainLnds = exports.getActiveOnchainLnd = exports.getActiveLnd = exports.offchainLnds = exports.getLnds = exports.onChannelUpdated = exports.updateEscrows = exports.updateRoutingRevenues = exports.getRoutingFees = exports.getBosScore = exports.nodesStats = exports.nodeStats = exports.lndBalances = exports.lndsBalances = exports.deleteExpiredLightningPaymentFlows = exports.deleteFailedPaymentsAttemptAllLnds = exports.deleteExpiredWalletInvoice = void 0;
const assert_1 = __importDefault(require("assert"));
const _config_1 = require("../../config/index");
const bitcoin_1 = require("../../domain/bitcoin");
const lightning_1 = require("../../domain/bitcoin/lightning");
const onchain_1 = require("../../domain/bitcoin/onchain");
const errors_1 = require("../../domain/errors");
const admin_legacy_1 = require("../ledger/admin-legacy");
const logger_1 = require("../logger");
const mongoose_1 = require("../mongoose");
const schema_1 = require("../mongoose/schema");
const _utils_1 = require("../../utils/index");
const axios_1 = __importDefault(require("axios"));
const lightning_2 = require("lightning");
const lodash_groupby_1 = __importDefault(require("lodash.groupby"));
const lodash_map_1 = __importDefault(require("lodash.map"));
const lodash_mapvalues_1 = __importDefault(require("lodash.mapvalues"));
const lodash_sumby_1 = __importDefault(require("lodash.sumby"));
const auth_1 = require("./auth");
const deleteExpiredWalletInvoice = async () => {
    const walletInvoicesRepo = (0, mongoose_1.WalletInvoicesRepository)();
    // this should be longer than the invoice validity time
    const delta = 90; // days
    const date = new Date(Date.now());
    date.setDate(date.getDate() - delta);
    const result = await walletInvoicesRepo.deleteUnpaidOlderThan(date);
    if (result instanceof Error) {
        logger_1.baseLogger.error({ error: result }, "error deleting expired invoices");
        return 0;
    }
    return result;
};
exports.deleteExpiredWalletInvoice = deleteExpiredWalletInvoice;
const deleteFailedPaymentsAttemptAllLnds = async () => {
    const lnds = exports.offchainLnds;
    for (const { lnd, socket } of lnds) {
        try {
            logger_1.baseLogger.info({ socket }, "running deleteFailedPaymentsAttempt");
            await (0, lightning_2.deleteFailedPayAttempts)({ lnd });
        }
        catch (err) {
            logger_1.baseLogger.warn({ err }, "error deleting failed payment");
        }
    }
};
exports.deleteFailedPaymentsAttemptAllLnds = deleteFailedPaymentsAttemptAllLnds;
const deleteExpiredLightningPaymentFlows = async () => {
    const paymentFlowRepo = (0, mongoose_1.PaymentFlowStateRepository)(lightning_1.defaultTimeToExpiryInSeconds);
    const deleted = await paymentFlowRepo.deleteExpiredLightningPaymentFlows();
    if (deleted instanceof Error) {
        if (!(deleted instanceof errors_1.CouldNotFindError)) {
            logger_1.baseLogger.error({ error: deleted }, "error deleting expired payment flows");
        }
        return 0;
    }
    return deleted;
};
exports.deleteExpiredLightningPaymentFlows = deleteExpiredLightningPaymentFlows;
const lndsBalances = async () => {
    const data = await Promise.all((0, exports.getLnds)().map(({ lnd }) => (0, exports.lndBalances)(lnd)));
    return {
        total: (0, bitcoin_1.toSats)((0, lodash_sumby_1.default)(data, "total")),
        onChain: (0, bitcoin_1.toSats)((0, lodash_sumby_1.default)(data, "onChain")),
        offChain: (0, bitcoin_1.toSats)((0, lodash_sumby_1.default)(data, "offChain")),
        opening_channel_balance: (0, bitcoin_1.toSats)((0, lodash_sumby_1.default)(data, "opening_channel_balance")),
        closing_channel_balance: (0, bitcoin_1.toSats)((0, lodash_sumby_1.default)(data, "closing_channel_balance")),
    };
};
exports.lndsBalances = lndsBalances;
const lndBalances = async (lnd) => {
    // Onchain
    const { chain_balance } = await (0, lightning_2.getChainBalance)({ lnd });
    const { channel_balance, pending_balance: opening_channel_balance } = await (0, lightning_2.getChannelBalance)({ lnd });
    //FIXME: This can cause incorrect balance to be reported in case an unconfirmed txn is later cancelled/double spent
    // bitcoind seems to have a way to report this correctly. does lnd have?
    const { pending_chain_balance } = await (0, lightning_2.getPendingChainBalance)({ lnd });
    // get pending closed
    const { channels: closedChannels } = await (0, lightning_2.getClosedChannels)({ lnd });
    // FIXME: there can be issue with channel not closed completely from lnd
    // https://github.com/alexbosworth/ln-service/issues/139
    logger_1.baseLogger.debug({ closedChannels }, "getClosedChannels");
    const closing_channel_balance = (0, lodash_sumby_1.default)(closedChannels, (channel) => (0, lodash_sumby_1.default)(channel.close_payments, (payment) => (payment.is_pending ? payment.tokens : 0)));
    // adds 330 sats for every selfInitiatedChannel even if not all channels use anchor
    const { channels } = await (0, lightning_2.getChannels)({ lnd });
    const selfInitiatedChannels = channels.filter(({ is_partner_initiated }) => is_partner_initiated === false);
    const satsAnchorOutput = 330;
    const anchorBalance = selfInitiatedChannels.length * satsAnchorOutput;
    const total = chain_balance +
        anchorBalance +
        channel_balance +
        pending_chain_balance +
        opening_channel_balance +
        closing_channel_balance;
    return {
        total,
        onChain: chain_balance + pending_chain_balance,
        offChain: channel_balance,
        opening_channel_balance,
        closing_channel_balance,
    };
};
exports.lndBalances = lndBalances;
async function nodeStats(lnd) {
    // FIXME: only return the public key from process.env
    // this would avoid a round trip to lnd
    const result = await (0, lightning_2.getWalletInfo)({ lnd });
    const peersCount = result.peers_count;
    const channelsCount = result.active_channels_count;
    const id = result.public_key;
    return {
        peersCount,
        channelsCount,
        id,
    };
}
exports.nodeStats = nodeStats;
const nodesStats = async () => {
    const data = exports.offchainLnds.map(({ lnd }) => nodeStats(lnd));
    // TODO: try if we don't need a Promise.all()
    return Promise.all(data);
};
exports.nodesStats = nodesStats;
async function getBosScore() {
    try {
        const { data } = await axios_1.default.get("https://bos.lightning.jorijn.com/data/export.json");
        // FIXME: manage multiple nodes
        const activeNode = (0, exports.getActiveLnd)();
        if (activeNode instanceof Error)
            return 0;
        const bosScore = data.data.find(({ publicKey }) => publicKey === activeNode.pubkey);
        if (!bosScore) {
            logger_1.baseLogger.info("key is not in bos list");
        }
        return bosScore.score;
    }
    catch (err) {
        return 0;
    }
}
exports.getBosScore = getBosScore;
const getRoutingFees = async ({ lnd, before, after, }) => {
    const forwardsList = await (0, lightning_2.getForwards)({ lnd, before, after });
    let next = forwardsList.next;
    let forwards = forwardsList.forwards;
    let finishedFetching = false;
    if (!next || !forwards || forwards.length <= 0) {
        finishedFetching = true;
    }
    while (!finishedFetching) {
        if (next) {
            const moreForwards = await (0, lightning_2.getForwards)({ lnd, token: next });
            forwards = [...forwards, ...moreForwards.forwards];
            next = moreForwards.next;
        }
        else {
            finishedFetching = true;
        }
    }
    // groups each forward object by date
    const dateGroupedForwards = (0, lodash_groupby_1.default)(forwards, (e) => new Date(e.created_at).toDateString());
    // returns revenue for each date by reducing all forwards for each date
    const feePerDate = (0, lodash_mapvalues_1.default)(dateGroupedForwards, (e) => (0, bitcoin_1.toSats)(e.reduce((sum, { fee_mtokens }) => sum + +fee_mtokens, 0) / 1000));
    // returns an array of objects where each object has key = date and value = fees
    return (0, lodash_map_1.default)(feePerDate, (v, k) => ({ [k]: v }));
};
exports.getRoutingFees = getRoutingFees;
const updateRoutingRevenues = async () => {
    // TODO: move to a service
    const dbMetadata = await schema_1.DbMetadata.findOne({});
    let lastDate;
    if (dbMetadata?.routingFeeLastEntry) {
        lastDate = new Date(dbMetadata.routingFeeLastEntry);
    }
    else {
        lastDate = new Date(0);
        logger_1.baseLogger.info("Running the routing fee revenue cronjob for the first time");
    }
    // Done to remove effect of timezone
    lastDate.setUTCHours(0, 0, 0, 0);
    const after = lastDate.toISOString();
    const endDate = (0, _utils_1.timestampDaysAgo)(_config_1.ONE_DAY);
    if (endDate instanceof Error)
        throw endDate;
    // Done to remove effect of timezone
    endDate.setUTCHours(0, 0, 0, 0);
    const before = endDate.toISOString();
    // Only record fee if it has been 1d+ since last record
    if ((endDate.getTime() - lastDate.getTime()) / _config_1.MS_PER_DAY < 1) {
        return;
    }
    // get fee collected day wise
    const activeNode = (0, exports.getActiveLnd)();
    if (activeNode instanceof Error)
        throw activeNode;
    const lnd = activeNode.lnd;
    const forwards = await (0, exports.getRoutingFees)({ lnd, before, after });
    for (const forward of forwards) {
        const [[day, fee]] = Object.entries(forward);
        const result = await (0, admin_legacy_1.addLndRoutingRevenue)({
            amount: fee,
            collectedOn: day,
        });
        if (result instanceof Error) {
            logger_1.baseLogger.error("Unable to record routing revenue", {
                forwardToClient: false,
                logger: logger_1.baseLogger,
                level: "error",
            });
        }
    }
    endDate.setDate(endDate.getDate() + 1);
    const endDay = endDate.toDateString();
    // TODO: move to a service
    await schema_1.DbMetadata.findOneAndUpdate({}, { $set: { routingFeeLastEntry: endDay } }, { upsert: true });
};
exports.updateRoutingRevenues = updateRoutingRevenues;
const updateEscrows = async () => {
    // FIXME: update escrow of all the node
    const activeNode = (0, exports.getActiveLnd)();
    if (activeNode instanceof Error)
        throw activeNode;
    const lnd = activeNode.lnd;
    const { channels } = await (0, lightning_2.getChannels)({ lnd });
    const selfInitiatedChannels = channels.filter(({ is_partner_initiated }) => is_partner_initiated === false);
    const escrowInLnd = (0, bitcoin_1.toSats)((0, lodash_sumby_1.default)(selfInitiatedChannels, "commit_transaction_fee"));
    const result = await (0, admin_legacy_1.updateLndEscrow)(escrowInLnd);
    logger_1.baseLogger.info({ ...result, channels }, "escrow recording");
};
exports.updateEscrows = updateEscrows;
const onChannelUpdated = async ({ channel, lnd, stateChange, }) => {
    logger_1.baseLogger.info({ channel, stateChange }, `channel update`);
    if (channel.is_partner_initiated) {
        // FIXME: this assume legacy channel, ie: non-anchored channel type
        // with anchor channels, the closing fees are not paid necessarily by the channel opener
        // but by whoever is closing the channel
        return;
    }
    if (stateChange === "closed") {
        // FIXME: need to account for channel closing
        return;
    }
    const { transaction_id: txid } = channel;
    // TODO: dedupe from onchain
    const { current_block_height } = await (0, lightning_2.getWalletInfo)({ lnd });
    const after = Math.max(0, current_block_height - _config_1.ONCHAIN_SCAN_DEPTH_CHANNEL_UPDATE); // this is necessary for tests, otherwise after may be negative
    const { transactions } = await (0, lightning_2.getChainTransactions)({ lnd, after });
    // end dedupe
    const tx = transactions.find(({ id }) => id === txid);
    if (!tx?.fee) {
        logger_1.baseLogger.error({ transactions }, "fee doesn't exist");
        return;
    }
    const fee = (0, bitcoin_1.toSats)(tx.fee);
    // let tx
    // try {
    //   tx = await bitcoindDefaultClient.getRawTransaction(txid, true /* include_watchonly */ )
    // } catch (err) {
    //   baseLogger.error({err}, "can't fetch fee for closing tx")
    // }
    // TODO: there is no fee currently given by bitcoind for raw transaction
    // either calculate it from the input, or use an indexer
    // const { fee } = tx.fee
    (0, assert_1.default)(fee > 0);
    const data = {
        description: `channel ${stateChange} onchain fee`,
        fee,
        metadata: { txid },
    };
    const success = await (0, admin_legacy_1.addLndChannelOpeningOrClosingFee)(data);
    if (success instanceof Error) {
        logger_1.baseLogger.error(data, "error onChannelUpdated");
    }
    else {
        logger_1.baseLogger.info({ channel, fee, txid }, `${stateChange} channel fee added to ledger`);
    }
};
exports.onChannelUpdated = onChannelUpdated;
const getLnds = ({ type, active, } = {}) => {
    let result = auth_1.params;
    if (type) {
        result = result.filter((node) => node.type.some((nodeType) => nodeType === type));
    }
    if (active) {
        result = result.filter(({ active }) => active);
    }
    return result;
};
exports.getLnds = getLnds;
exports.offchainLnds = (0, exports.getLnds)({ type: "offchain" });
// only returning the first one for now
const getActiveLnd = () => {
    const lnds = (0, exports.getLnds)({ active: true, type: "offchain" });
    if (lnds.length === 0) {
        return new lightning_1.OffChainServiceUnavailableError("no active lightning node (for offchain)");
    }
    return lnds[0];
    // an alternative that would load balance would be:
    // const index = Math.floor(Math.random() * lnds.length)
    // return lnds[index]
};
exports.getActiveLnd = getActiveLnd;
const getActiveOnchainLnd = () => {
    const lnds = (0, exports.getLnds)({ active: true, type: "onchain" });
    if (lnds.length === 0) {
        return new onchain_1.OnChainServiceUnavailableError("no active lightning node (for onchain)");
    }
    return lnds[0];
};
exports.getActiveOnchainLnd = getActiveOnchainLnd;
exports.onchainLnds = (0, exports.getLnds)({ type: "onchain" });
exports.nodesPubKey = exports.offchainLnds.map((item) => item.pubkey);
const getLndFromPubkey = ({ pubkey, }) => {
    const lnds = (0, exports.getLnds)({ active: true });
    const lndParams = lnds.find(({ pubkey: nodePubKey }) => nodePubKey === pubkey);
    return (lndParams?.lnd ||
        new lightning_1.NoValidNodeForPubkeyError(`lnd with pubkey:${pubkey} is offline`));
};
exports.getLndFromPubkey = getLndFromPubkey;
// A rough description of the error type we get back from the
// 'lightning' library can be described as:
//
// [
//   0: <Error Classification Code Number>
//   1: <Error Type String>
//   2: {
//     err?: <Error Code Details Object>
//     failures?: [
//       [
//         0: <Error Code Number>
//         1: <Error Code Message String>
//         2: {
//           err?: <Error Code Details Object>
//         }
//       ]
//     ]
//   }
// ]
//
// where '<Error Code Details Object>' is an Error object with
// the usual 'message', 'stack' etc. properties and additional
// properties: 'code', 'details', 'metadata'.
/* eslint @typescript-eslint/ban-ts-comment: "off" */
// @ts-ignore-next-line no-implicit-any error
const parseLndErrorDetails = (err) => err[2]?.err?.details || err[2]?.failures?.[0]?.[2]?.err?.details || err[1];
exports.parseLndErrorDetails = parseLndErrorDetails;
//# sourceMappingURL=utils.js.map