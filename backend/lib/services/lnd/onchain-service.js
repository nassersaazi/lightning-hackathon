"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractOutgoingTransactions = exports.extractIncomingTransactions = exports.OnChainService = void 0;
const bitcoin_1 = require("../../domain/bitcoin");
const onchain_1 = require("../../domain/bitcoin/onchain");
const lightning_1 = require("lightning");
const _config_1 = require("../../config/index");
const cache_1 = require("../../domain/cache");
const cache_2 = require("../cache");
const tracing_1 = require("../tracing");
const utils_1 = require("./utils");
const OnChainService = (decoder) => {
    const activeNode = (0, utils_1.getActiveOnchainLnd)();
    if (activeNode instanceof Error)
        return activeNode;
    const lnd = activeNode.lnd;
    const pubkey = activeNode.pubkey;
    const listActivePubkeys = () => (0, utils_1.getLnds)({ active: true, type: "onchain" }).map((lndAuth) => lndAuth.pubkey);
    const getBalance = async (pubkey) => {
        try {
            const lndInstance = pubkey ? (0, utils_1.getLndFromPubkey)({ pubkey }) : lnd;
            if (lndInstance instanceof Error)
                return lndInstance;
            const { chain_balance } = await (0, lightning_1.getChainBalance)({ lnd: lndInstance });
            return (0, bitcoin_1.toSats)(chain_balance);
        }
        catch (err) {
            const errDetails = (0, utils_1.parseLndErrorDetails)(err);
            return new onchain_1.OnChainServiceUnavailableError(errDetails);
        }
    };
    const getPendingBalance = async (pubkey) => {
        try {
            const lndInstance = pubkey ? (0, utils_1.getLndFromPubkey)({ pubkey }) : lnd;
            if (lndInstance instanceof Error)
                return lndInstance;
            const { pending_chain_balance } = await (0, lightning_1.getPendingChainBalance)({ lnd: lndInstance });
            return (0, bitcoin_1.toSats)(pending_chain_balance);
        }
        catch (err) {
            const errDetails = (0, utils_1.parseLndErrorDetails)(err);
            return new onchain_1.OnChainServiceUnavailableError(errDetails);
        }
    };
    const listTransactions = async (scanDepth) => {
        try {
            let blockHeight = await getCachedHeight();
            if (!blockHeight) {
                ;
                ({ current_block_height: blockHeight } = await (0, lightning_1.getWalletInfo)({ lnd }));
                await (0, cache_2.LocalCacheService)().set({
                    key: cache_1.CacheKeys.BlockHeight,
                    value: blockHeight,
                    ttlSecs: _config_1.SECS_PER_5_MINS,
                });
            }
            // this is necessary for tests, otherwise `after` may be negative
            const after = Math.max(0, blockHeight - scanDepth);
            return (0, lightning_1.getChainTransactions)({
                lnd,
                after,
            });
        }
        catch (err) {
            return handleCommonOnChainServiceErrors(err);
        }
    };
    const listIncomingTransactions = async (scanDepth) => {
        const txs = await listTransactions(scanDepth);
        if (txs instanceof Error)
            return txs;
        return (0, exports.extractIncomingTransactions)({ decoder, txs });
    };
    const listOutgoingTransactions = async (scanDepth) => {
        const txs = await listTransactions(scanDepth);
        if (txs instanceof Error)
            return txs;
        return (0, exports.extractOutgoingTransactions)({ decoder, txs });
    };
    const createOnChainAddress = async () => {
        try {
            const { address } = await (0, lightning_1.createChainAddress)({
                lnd,
                format: "p2wpkh",
            });
            return { address: address, pubkey };
        }
        catch (err) {
            return handleCommonOnChainServiceErrors(err);
        }
    };
    const lookupOnChainFee = async ({ txHash, scanDepth, }) => {
        const onChainTxs = await listOutgoingTransactions(scanDepth);
        if (onChainTxs instanceof Error)
            return onChainTxs;
        const tx = onChainTxs.find((tx) => tx.rawTx.txHash === txHash);
        return (tx && tx.fee) || new onchain_1.CouldNotFindOnChainTransactionError();
    };
    const getOnChainFeeEstimate = async ({ amount, address, targetConfirmations, }) => {
        const sendTo = [{ address, tokens: amount }];
        try {
            const { fee } = await (0, lightning_1.getChainFeeEstimate)({
                lnd,
                send_to: sendTo,
                utxo_confirmations: 1,
                target_confirmations: targetConfirmations,
            });
            return (0, bitcoin_1.toSats)(fee);
        }
        catch (err) {
            const errDetails = (0, utils_1.parseLndErrorDetails)(err);
            const match = (knownErrDetail) => knownErrDetail.test(errDetails);
            switch (true) {
                case match(KnownLndErrorDetails.InsufficientFunds):
                    return new onchain_1.InsufficientOnChainFundsError();
                default:
                    return handleCommonOnChainServiceErrors(err);
            }
        }
    };
    const payToAddress = async ({ amount, address, targetConfirmations, description, }) => {
        try {
            const { id } = await (0, lightning_1.sendToChainAddress)({
                lnd,
                address,
                tokens: amount,
                utxo_confirmations: 1,
                target_confirmations: targetConfirmations,
                description,
            });
            return id;
        }
        catch (err) {
            const errDetails = (0, utils_1.parseLndErrorDetails)(err);
            const match = (knownErrDetail) => knownErrDetail.test(errDetails);
            switch (true) {
                case match(KnownLndErrorDetails.InsufficientFunds):
                    return new onchain_1.InsufficientOnChainFundsError();
                case match(KnownLndErrorDetails.CPFPAncestorLimitReached):
                    return new onchain_1.CPFPAncestorLimitReachedError();
                default:
                    return handleCommonOnChainServiceErrors(err);
            }
        }
    };
    return (0, tracing_1.wrapAsyncFunctionsToRunInSpan)({
        namespace: "services.lnd.onchain",
        fns: {
            listActivePubkeys,
            getBalance,
            getPendingBalance,
            listIncomingTransactions,
            lookupOnChainFee,
            createOnChainAddress,
            getOnChainFeeEstimate,
            payToAddress,
        },
    });
};
exports.OnChainService = OnChainService;
const KnownLndErrorDetails = {
    InsufficientFunds: /insufficient funds available to construct transaction/,
    ConnectionDropped: /Connection dropped/,
    CPFPAncestorLimitReached: /unmatched backend error: -26: too-long-mempool-chain, too many .* \[limit: \d+\]/,
    NoConnectionEstablished: /No connection established/,
};
const extractIncomingTransactions = ({ decoder, txs, }) => {
    return txs.transactions
        .filter((tx) => !tx.is_outgoing && !!tx.transaction)
        .map((tx) => (0, onchain_1.IncomingOnChainTransaction)({
        confirmations: tx.confirmation_count || 0,
        rawTx: decoder.decode(tx.transaction),
        fee: (0, bitcoin_1.toSats)(tx.fee || 0),
        createdAt: new Date(tx.created_at),
    }));
};
exports.extractIncomingTransactions = extractIncomingTransactions;
const extractOutgoingTransactions = ({ decoder, txs, }) => {
    return txs.transactions
        .filter((tx) => tx.is_outgoing && !!tx.transaction)
        .map((tx) => (0, onchain_1.OutgoingOnChainTransaction)({
        confirmations: tx.confirmation_count || 0,
        rawTx: decoder.decode(tx.transaction),
        fee: (0, bitcoin_1.toSats)(tx.fee || 0),
        createdAt: new Date(tx.created_at),
    }));
};
exports.extractOutgoingTransactions = extractOutgoingTransactions;
const getCachedHeight = async () => {
    const cachedHeight = await (0, cache_2.LocalCacheService)().get({
        key: cache_1.CacheKeys.BlockHeight,
    });
    if (cachedHeight instanceof Error)
        return 0;
    return cachedHeight;
};
const handleCommonOnChainServiceErrors = (err) => {
    const errDetails = (0, utils_1.parseLndErrorDetails)(err);
    const match = (knownErrDetail) => knownErrDetail.test(errDetails);
    switch (true) {
        case match(KnownLndErrorDetails.ConnectionDropped):
        case match(KnownLndErrorDetails.NoConnectionEstablished):
            return new onchain_1.OnChainServiceUnavailableError();
        default:
            return new onchain_1.UnknownOnChainServiceError(msgForUnknown(err));
    }
};
const msgForUnknown = (err) => JSON.stringify({
    parsedLndErrorDetails: (0, utils_1.parseLndErrorDetails)(err),
    detailsFromLnd: err,
});
//# sourceMappingURL=onchain-service.js.map