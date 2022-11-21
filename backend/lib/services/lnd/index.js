"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownLndErrorDetails = exports.LndService = void 0;
const lightning_1 = require("lightning");
const ln_service_1 = __importDefault(require("ln-service"));
const _config_1 = require("../../config/index");
const bitcoin_1 = require("../../domain/bitcoin");
const lightning_2 = require("../../domain/bitcoin/lightning");
const cache_1 = require("../../domain/cache");
const payments_1 = require("../../domain/payments");
const shared_1 = require("../../domain/shared");
const cache_2 = require("../cache");
const tracing_1 = require("../tracing");
const _utils_1 = require("../../utils/index");
const lodash_sumby_1 = __importDefault(require("lodash.sumby"));
const auth_1 = require("./auth");
const utils_1 = require("./utils");
const LndService = () => {
    const activeNode = (0, utils_1.getActiveLnd)();
    if (activeNode instanceof Error)
        return activeNode;
    const defaultLnd = activeNode.lnd;
    const defaultPubkey = activeNode.pubkey;
    const isLocal = (pubkey) => (0, utils_1.getLnds)({ type: "offchain" }).some((item) => item.pubkey === pubkey);
    const listActivePubkeys = () => (0, utils_1.getLnds)({ active: true, type: "offchain" }).map((lndAuth) => lndAuth.pubkey);
    const listAllPubkeys = () => (0, utils_1.getLnds)({ type: "offchain" }).map((lndAuth) => lndAuth.pubkey);
    const getBalance = async (pubkey) => {
        try {
            const lnd = pubkey ? (0, utils_1.getLndFromPubkey)({ pubkey }) : defaultLnd;
            if (lnd instanceof Error)
                return lnd;
            const { channel_balance } = await (0, lightning_1.getChannelBalance)({ lnd });
            return (0, bitcoin_1.toSats)(channel_balance);
        }
        catch (err) {
            return handleCommonLightningServiceErrors(err);
        }
    };
    const getInboundOutboundBalance = async (pubkey) => {
        try {
            const lnd = pubkey ? (0, utils_1.getLndFromPubkey)({ pubkey }) : defaultLnd;
            if (lnd instanceof Error)
                return lnd;
            const { channel_balance, inbound } = await (0, lightning_1.getChannelBalance)({ lnd });
            const inboundBal = inbound ?? 0;
            const outbound = channel_balance - inboundBal;
            return {
                channelBalance: (0, bitcoin_1.toSats)(channel_balance),
                inbound: (0, bitcoin_1.toSats)(inboundBal),
                outbound: (0, bitcoin_1.toSats)(outbound),
            };
        }
        catch (err) {
            const errDetails = (0, utils_1.parseLndErrorDetails)(err);
            return new lightning_2.UnknownLightningServiceError(errDetails);
        }
    };
    const getOpeningChannelsBalance = async (pubkey) => {
        try {
            const lnd = pubkey ? (0, utils_1.getLndFromPubkey)({ pubkey }) : defaultLnd;
            if (lnd instanceof Error)
                return lnd;
            const { pending_balance } = await (0, lightning_1.getChannelBalance)({ lnd });
            return (0, bitcoin_1.toSats)(pending_balance);
        }
        catch (err) {
            return handleCommonLightningServiceErrors(err);
        }
    };
    const getClosingChannelsBalance = async (pubkey) => {
        try {
            const lnd = pubkey ? (0, utils_1.getLndFromPubkey)({ pubkey }) : defaultLnd;
            if (lnd instanceof Error)
                return lnd;
            const { pending_channels } = await (0, lightning_1.getPendingChannels)({ lnd });
            const closingChannelBalance = (0, lodash_sumby_1.default)(pending_channels, (c) => c.is_closing ? c.pending_balance || c.local_balance : 0);
            return (0, bitcoin_1.toSats)(closingChannelBalance);
        }
        catch (err) {
            return handleCommonLightningServiceErrors(err);
        }
    };
    const findRouteForInvoice = async ({ invoice, amount, }) => {
        let sats = (0, bitcoin_1.toSats)(0);
        if (amount) {
            sats = (0, bitcoin_1.toSats)(Number(amount.amount));
        }
        else {
            if (!(invoice.amount && invoice.amount > 0))
                return new lightning_2.LightningServiceError("No amount invoice passed to method. Expected a valid amount to be present.");
            sats = invoice.amount;
        }
        const btcAmount = (0, shared_1.paymentAmountFromNumber)({
            amount: sats,
            currency: shared_1.WalletCurrency.Btc,
        });
        if (btcAmount instanceof Error)
            return btcAmount;
        const maxFeeAmount = (0, payments_1.LnFees)().maxProtocolFee(btcAmount);
        const rawRoute = await probeForRoute({
            decodedInvoice: invoice,
            maxFee: (0, bitcoin_1.toSats)(maxFeeAmount.amount),
            amount: sats,
        });
        if (rawRoute instanceof Error)
            return rawRoute;
        return {
            pubkey: defaultPubkey,
            rawRoute,
        };
    };
    const findRouteForNoAmountInvoice = async ({ decodedInvoice, maxFee, amount, }) => {
        if (!(amount && amount > 0))
            return new lightning_2.LightningServiceError("Invalid amount passed to method for invoice with no amount. Expected a valid amount to be passed.");
        return probeForRoute({
            decodedInvoice,
            maxFee,
            amount,
        });
    };
    const probeForRoute = async ({ decodedInvoice, maxFee, amount, }) => {
        try {
            const routes = decodedInvoice.routeHints.map((route) => route.map((hop) => ({
                base_fee_mtokens: hop.baseFeeMTokens
                    ? parseFloat(hop.baseFeeMTokens)
                    : undefined,
                channel: hop.channel,
                cltv_delta: hop.cltvDelta,
                fee_rate: hop.feeRate,
                public_key: hop.nodePubkey,
            })));
            const probeForRouteArgs = {
                lnd: defaultLnd,
                destination: decodedInvoice.destination,
                mtokens: decodedInvoice.milliSatsAmount > 0
                    ? decodedInvoice.milliSatsAmount.toString()
                    : (amount * 1000).toString(),
                routes,
                cltv_delta: decodedInvoice.cltvDelta || undefined,
                features: decodedInvoice.features
                    ? decodedInvoice.features.map((f) => ({
                        bit: f.bit,
                        is_required: f.isRequired,
                        type: f.type,
                    }))
                    : undefined,
                max_fee: maxFee,
                payment: decodedInvoice.paymentSecret || undefined,
                total_mtokens: decodedInvoice.paymentSecret
                    ? decodedInvoice.milliSatsAmount > 0
                        ? decodedInvoice.milliSatsAmount.toString()
                        : (amount * 1000).toString()
                    : undefined,
                tokens: amount,
            };
            const routePromise = ln_service_1.default.probeForRoute(probeForRouteArgs);
            const timeoutPromise = (0, _utils_1.timeout)(auth_1.TIMEOUT_PAYMENT, "Timeout");
            const { route } = await Promise.race([routePromise, timeoutPromise]);
            if (!route)
                return new lightning_2.RouteNotFoundError();
            return route;
        }
        catch (err) {
            if (err.message === "Timeout") {
                return new lightning_2.ProbeForRouteTimedOutFromApplicationError();
            }
            const errDetails = (0, utils_1.parseLndErrorDetails)(err);
            const match = (knownErrDetail) => knownErrDetail.test(errDetails);
            switch (true) {
                case match(exports.KnownLndErrorDetails.InsufficientBalance):
                    return new lightning_2.InsufficientBalanceForRoutingError();
                case match(exports.KnownLndErrorDetails.ProbeForRouteTimedOut):
                    return new lightning_2.ProbeForRouteTimedOutError();
                default:
                    return handleCommonRouteNotFoundErrors(err);
            }
        }
    };
    const registerInvoice = async ({ paymentHash, sats, description, descriptionHash, expiresAt, }) => {
        const input = {
            lnd: defaultLnd,
            id: paymentHash,
            description,
            description_hash: descriptionHash,
            tokens: sats,
            expires_at: expiresAt.toISOString(),
        };
        try {
            const result = await (0, lightning_1.createHodlInvoice)(input);
            const request = result.request;
            const returnedInvoice = (0, lightning_2.decodeInvoice)(request);
            if (returnedInvoice instanceof Error) {
                return new lightning_2.CouldNotDecodeReturnedPaymentRequest(returnedInvoice.message);
            }
            const registerInvoice = {
                invoice: returnedInvoice,
                pubkey: defaultPubkey,
            };
            return registerInvoice;
        }
        catch (err) {
            return handleCommonLightningServiceErrors(err);
        }
    };
    const lookupInvoice = async ({ pubkey, paymentHash, }) => {
        try {
            const lnd = (0, utils_1.getLndFromPubkey)({ pubkey });
            if (lnd instanceof Error)
                return lnd;
            const invoice = await (0, lightning_1.getInvoice)({
                lnd,
                id: paymentHash,
            });
            return translateLnInvoiceLookup(invoice);
        }
        catch (err) {
            const errDetails = (0, utils_1.parseLndErrorDetails)(err);
            const match = (knownErrDetail) => knownErrDetail.test(errDetails);
            switch (true) {
                case match(exports.KnownLndErrorDetails.InvoiceNotFound):
                    return new lightning_2.InvoiceNotFoundError();
                default:
                    return handleCommonLightningServiceErrors(err);
            }
        }
    };
    const lookupPayment = async ({ pubkey, paymentHash, }) => {
        if (pubkey)
            return lookupPaymentByPubkeyAndHash({ pubkey, paymentHash });
        const offchainLnds = (0, utils_1.getLnds)({ type: "offchain" });
        for (const { pubkey } of offchainLnds) {
            const payment = await lookupPaymentByPubkeyAndHash({
                pubkey: pubkey,
                paymentHash,
            });
            if (payment instanceof Error)
                continue;
            return payment;
        }
        return new lightning_2.PaymentNotFoundError(JSON.stringify({ paymentHash, pubkey }));
    };
    const listPaymentsFactory = (getPaymentsFn) => async ({ after, pubkey, }) => {
        const lnd = (0, utils_1.getLndFromPubkey)({ pubkey });
        if (lnd instanceof Error)
            return lnd;
        const pagingArgs = after ? { token: after } : {};
        try {
            const { payments, next } = await getPaymentsFn({ lnd, ...pagingArgs });
            return {
                lnPayments: payments.map(translateLnPaymentLookup),
                endCursor: next || false,
            };
        }
        catch (err) {
            const errDetails = (0, utils_1.parseLndErrorDetails)(err);
            const match = (knownErrDetail) => knownErrDetail.test(errDetails);
            switch (true) {
                case match(exports.KnownLndErrorDetails.LndDbCorruption):
                    return new lightning_2.CorruptLndDbError(`Corrupted DB error for node with pubkey: ${pubkey}`);
                default:
                    return handleCommonRouteNotFoundErrors(err);
            }
        }
    };
    const listFailedPayments = async (args) => {
        const result = await listPaymentsFactory(lightning_1.getFailedPayments)(args);
        if (result instanceof Error)
            return result;
        const { lnPayments, endCursor } = result;
        return {
            lnPayments: lnPayments.map((p) => ({ ...p, status: lightning_2.PaymentStatus.Failed })),
            endCursor,
        };
    };
    const listInvoices = async (lnd) => {
        try {
            let after = undefined;
            let rawInvoices = [];
            while (after !== false) {
                const pagingArgs = after ? { token: after } : {};
                const { invoices, next } = await (0, lightning_1.getInvoices)({ lnd, ...pagingArgs });
                rawInvoices = [...rawInvoices, ...invoices];
                after = next || false;
            }
            return rawInvoices.map(translateLnInvoiceLookup);
        }
        catch (err) {
            return handleCommonLightningServiceErrors(err);
        }
    };
    const deletePaymentByHash = async ({ paymentHash, pubkey, }) => {
        const offchainLnds = pubkey ? [{ pubkey }] : (0, utils_1.getLnds)({ type: "offchain" });
        for (const { pubkey } of offchainLnds) {
            const payment = await deletePaymentByPubkeyAndHash({
                pubkey: pubkey,
                paymentHash,
            });
            if (payment instanceof Error)
                return payment;
            if (!payment)
                continue;
            return payment;
        }
        return true;
    };
    const deletePaymentByPubkeyAndHash = async ({ paymentHash, pubkey, }) => {
        const lnd = (0, utils_1.getLndFromPubkey)({ pubkey });
        if (lnd instanceof Error)
            return lnd;
        try {
            await (0, lightning_1.deletePayment)({ id: paymentHash, lnd });
            return true;
        }
        catch (err) {
            const errDetails = (0, utils_1.parseLndErrorDetails)(err);
            const match = (knownErrDetail) => knownErrDetail.test(errDetails);
            switch (true) {
                case match(exports.KnownLndErrorDetails.PaymentForDeleteNotFound):
                    return false;
                default:
                    return handleCommonRouteNotFoundErrors(err);
            }
        }
    };
    const settleInvoice = async ({ pubkey, secret, }) => {
        try {
            const lnd = (0, utils_1.getLndFromPubkey)({ pubkey });
            if (lnd instanceof Error)
                return lnd;
            // Use the secret to claim the funds
            await (0, lightning_1.settleHodlInvoice)({ lnd, secret });
            return true;
        }
        catch (err) {
            const errDetails = (0, utils_1.parseLndErrorDetails)(err);
            const match = (knownErrDetail) => knownErrDetail.test(errDetails);
            switch (true) {
                case match(exports.KnownLndErrorDetails.SecretDoesNotMatchAnyExistingHodlInvoice):
                    return new lightning_2.SecretDoesNotMatchAnyExistingHodlInvoiceError(err);
                default:
                    return handleCommonLightningServiceErrors(err);
            }
        }
    };
    const cancelInvoice = async ({ pubkey, paymentHash, }) => {
        try {
            const lnd = (0, utils_1.getLndFromPubkey)({ pubkey });
            if (lnd instanceof Error)
                return lnd;
            await (0, lightning_1.cancelHodlInvoice)({ lnd, id: paymentHash });
            return true;
        }
        catch (err) {
            const errDetails = (0, utils_1.parseLndErrorDetails)(err);
            const match = (knownErrDetail) => knownErrDetail.test(errDetails);
            switch (true) {
                case match(exports.KnownLndErrorDetails.InvoiceNotFound):
                case match(exports.KnownLndErrorDetails.InvoiceAlreadySettled):
                    return true;
                default:
                    return handleCommonLightningServiceErrors(err);
            }
        }
    };
    const payInvoiceViaRoutes = async ({ paymentHash, rawRoute, pubkey, }) => {
        try {
            const lnd = (0, utils_1.getLndFromPubkey)({ pubkey });
            if (lnd instanceof Error)
                return lnd;
            const paymentPromise = (0, lightning_1.payViaRoutes)({
                lnd,
                routes: [rawRoute],
                id: paymentHash,
            });
            const timeoutPromise = (0, _utils_1.timeout)(auth_1.TIMEOUT_PAYMENT, "Timeout");
            const paymentResult = (await Promise.race([
                paymentPromise,
                timeoutPromise,
            ]));
            return {
                roundedUpFee: (0, bitcoin_1.toSats)(paymentResult.safe_fee),
                revealedPreImage: paymentResult.secret,
                sentFromPubkey: pubkey,
            };
        }
        catch (err) {
            if (err.message === "Timeout")
                return new lightning_2.LnPaymentPendingError();
            return handleSendPaymentLndErrors({ err, paymentHash });
        }
    };
    const payInvoiceViaPaymentDetails = async ({ decodedInvoice, btcPaymentAmount, maxFeeAmount, }) => {
        const milliSatsAmount = btcPaymentAmount.amount * 1000n;
        const maxFee = maxFeeAmount.amount;
        let routes = [];
        if (decodedInvoice.routeHints) {
            routes = decodedInvoice.routeHints.map((route) => route.map((hop) => ({
                base_fee_mtokens: hop.baseFeeMTokens,
                channel: hop.channel,
                cltv_delta: hop.cltvDelta,
                fee_rate: hop.feeRate,
                public_key: hop.nodePubkey,
            })));
        }
        const paymentDetailsArgs = {
            lnd: defaultLnd,
            id: decodedInvoice.paymentHash,
            destination: decodedInvoice.destination,
            mtokens: milliSatsAmount.toString(),
            payment: decodedInvoice.paymentSecret,
            max_fee: Number(maxFee),
            cltv_delta: decodedInvoice.cltvDelta || undefined,
            features: decodedInvoice.features
                ? decodedInvoice.features.map((f) => ({
                    bit: f.bit,
                    is_required: f.isRequired,
                    type: f.type,
                }))
                : undefined,
            routes,
        };
        try {
            const paymentPromise = (0, lightning_1.payViaPaymentDetails)(paymentDetailsArgs);
            const timeoutPromise = (0, _utils_1.timeout)(auth_1.TIMEOUT_PAYMENT, "Timeout");
            const paymentResult = (await Promise.race([
                paymentPromise,
                timeoutPromise,
            ]));
            return {
                roundedUpFee: (0, bitcoin_1.toSats)(paymentResult.safe_fee),
                revealedPreImage: paymentResult.secret,
                sentFromPubkey: defaultPubkey,
            };
        }
        catch (err) {
            if (err.message === "Timeout")
                return new lightning_2.LnPaymentPendingError();
            return handleSendPaymentLndErrors({ err, paymentHash: decodedInvoice.paymentHash });
        }
    };
    return (0, tracing_1.wrapAsyncFunctionsToRunInSpan)({
        namespace: "services.lnd.offchain",
        fns: {
            isLocal,
            defaultPubkey: () => defaultPubkey,
            listActivePubkeys,
            listAllPubkeys,
            getBalance,
            getInboundOutboundBalance,
            getOpeningChannelsBalance,
            getClosingChannelsBalance,
            findRouteForInvoice,
            findRouteForNoAmountInvoice,
            registerInvoice,
            lookupInvoice,
            lookupPayment,
            listSettledPayments: listPaymentsFactory(lightning_1.getPayments),
            listPendingPayments: listPaymentsFactory(lightning_1.getPendingPayments),
            listFailedPayments,
            listInvoices,
            deletePaymentByHash,
            settleInvoice,
            cancelInvoice,
            payInvoiceViaRoutes,
            payInvoiceViaPaymentDetails,
        },
    });
};
exports.LndService = LndService;
const lookupPaymentByPubkeyAndHash = async ({ pubkey, paymentHash, }) => {
    try {
        const lnd = (0, utils_1.getLndFromPubkey)({ pubkey });
        if (lnd instanceof Error)
            return lnd;
        const result = await (0, lightning_1.getPayment)({
            lnd,
            id: paymentHash,
        });
        const { payment, pending } = result;
        const status = await resolvePaymentStatus({ lnd, result });
        if (payment) {
            return {
                createdAt: new Date(payment.created_at),
                status,
                paymentRequest: payment.request || undefined,
                paymentHash: payment.id,
                milliSatsAmount: (0, bitcoin_1.toMilliSatsFromString)(payment.mtokens),
                roundedUpAmount: (0, bitcoin_1.toSats)(payment.safe_tokens),
                confirmedDetails: {
                    confirmedAt: new Date(payment.confirmed_at),
                    destination: payment.destination,
                    revealedPreImage: payment.secret,
                    roundedUpFee: (0, bitcoin_1.toSats)(payment.safe_fee),
                    milliSatsFee: (0, bitcoin_1.toMilliSatsFromString)(payment.fee_mtokens),
                    hopPubkeys: undefined,
                },
                attempts: undefined,
            };
        }
        else if (pending) {
            return {
                createdAt: new Date(pending.created_at),
                status,
                paymentRequest: pending.request || undefined,
                paymentHash: pending.id,
                milliSatsAmount: (0, bitcoin_1.toMilliSatsFromString)(pending.mtokens),
                roundedUpAmount: (0, bitcoin_1.toSats)(pending.safe_tokens),
                confirmedDetails: undefined,
                attempts: undefined,
            };
        }
        else if (status === lightning_2.PaymentStatus.Failed) {
            return { status: lightning_2.PaymentStatus.Failed };
        }
        return new lightning_2.BadPaymentDataError(JSON.stringify(result));
    }
    catch (err) {
        const errDetails = (0, utils_1.parseLndErrorDetails)(err);
        const match = (knownErrDetail) => knownErrDetail.test(errDetails);
        switch (true) {
            case match(exports.KnownLndErrorDetails.SentPaymentNotFound):
                return new lightning_2.PaymentNotFoundError(JSON.stringify({ paymentHash, pubkey }));
            default:
                return handleCommonLightningServiceErrors(err);
        }
    }
};
exports.KnownLndErrorDetails = {
    InsufficientBalance: /insufficient local balance/,
    InsufficientBalanceToAttemptPayment: /InsufficientBalanceToAttemptPayment/,
    InvoiceNotFound: /unable to locate invoice/,
    InvoiceAlreadyPaid: /invoice is already paid/,
    UnableToFindRoute: /PaymentPathfindingFailedToFindPossibleRoute/,
    UnknownNextPeer: /UnknownNextPeer/,
    LndDbCorruption: /payment isn't initiated/,
    PaymentRejectedByDestination: /PaymentRejectedByDestination/,
    UnknownPaymentHash: /UnknownPaymentHash/,
    PaymentAttemptsTimedOut: /PaymentAttemptsTimedOut/,
    ProbeForRouteTimedOut: /ProbeForRouteTimedOut/,
    SentPaymentNotFound: /SentPaymentNotFound/,
    PaymentInTransition: /payment is in transition/,
    PaymentForDeleteNotFound: /non bucket element in payments bucket/,
    SecretDoesNotMatchAnyExistingHodlInvoice: /SecretDoesNotMatchAnyExistingHodlInvoice/,
    ConnectionDropped: /Connection dropped/,
    TemporaryChannelFailure: /TemporaryChannelFailure/,
    InvoiceAlreadySettled: /invoice already settled/,
    NoConnectionEstablished: /No connection established/,
};
/* eslint @typescript-eslint/ban-ts-comment: "off" */
// @ts-ignore-next-line no-implicit-any error
const translateLnPaymentLookup = (p) => ({
    createdAt: new Date(p.created_at),
    status: p.is_confirmed ? lightning_2.PaymentStatus.Settled : lightning_2.PaymentStatus.Pending,
    paymentHash: p.id,
    paymentRequest: p.request,
    milliSatsAmount: (0, bitcoin_1.toMilliSatsFromString)(p.mtokens),
    roundedUpAmount: (0, bitcoin_1.toSats)(p.safe_tokens),
    confirmedDetails: p.is_confirmed
        ? {
            confirmedAt: new Date(p.confirmed_at),
            destination: p.destination,
            revealedPreImage: p.secret,
            roundedUpFee: (0, bitcoin_1.toSats)(p.safe_fee),
            milliSatsFee: (0, bitcoin_1.toMilliSatsFromString)(p.fee_mtokens),
            hopPubkeys: p.hops,
        }
        : undefined,
    attempts: p.attempts,
});
const translateLnInvoiceLookup = (invoice) => ({
    paymentHash: invoice.id,
    createdAt: new Date(invoice.created_at),
    confirmedAt: invoice.confirmed_at ? new Date(invoice.confirmed_at) : undefined,
    isSettled: !!invoice.is_confirmed,
    isCanceled: !!invoice.is_canceled,
    isHeld: !!invoice.is_held,
    heldAt: invoice.payments && invoice.payments.length
        ? new Date(invoice.payments[0].created_at)
        : undefined,
    roundedDownReceived: (0, bitcoin_1.toSats)(invoice.received),
    milliSatsReceived: (0, bitcoin_1.toMilliSatsFromString)(invoice.received_mtokens),
    secretPreImage: invoice.secret,
    lnInvoice: {
        description: invoice.description,
        paymentRequest: invoice.request || undefined,
        expiresAt: new Date(invoice.expires_at),
        roundedDownAmount: (0, bitcoin_1.toSats)(invoice.tokens),
    },
});
const resolvePaymentStatus = async ({ lnd, result, }) => {
    const { is_confirmed, is_failed, payment, pending } = result;
    if (is_confirmed)
        return lightning_2.PaymentStatus.Settled;
    if (is_failed)
        return lightning_2.PaymentStatus.Failed;
    const cache = (0, cache_2.LocalCacheService)();
    const currentBlockHeight = await cache.getOrSet({
        key: cache_1.CacheKeys.BlockHeight,
        ttlSecs: _config_1.SECS_PER_5_MINS,
        getForCaching: async () => {
            const { current_block_height } = await (0, lightning_1.getWalletInfo)({ lnd });
            return current_block_height;
        },
    });
    const timeout = pending?.timeout || payment?.timeout;
    // This is a hack to handle lnd issue with pending HTLCs after channel close
    // https://github.com/lightningnetwork/lnd/issues/6249
    if (timeout && pending && currentBlockHeight > timeout) {
        const closedChannels = await cache.getOrSet({
            key: cache_1.CacheKeys.ClosedChannels,
            ttlSecs: _config_1.SECS_PER_5_MINS,
            getForCaching: async () => {
                const { channels } = await (0, lightning_1.getClosedChannels)({ lnd });
                return channels;
            },
        });
        const failed = pending.paths
            .map((p) => {
            const [first] = p.hops;
            return closedChannels.find((c) => c.id === first.channel);
        })
            .every((s) => !!s);
        if (failed)
            return lightning_2.PaymentStatus.Failed;
    }
    return lightning_2.PaymentStatus.Pending;
};
const handleSendPaymentLndErrors = ({ err, paymentHash, }) => {
    const errDetails = (0, utils_1.parseLndErrorDetails)(err);
    const match = (knownErrDetail) => knownErrDetail.test(errDetails);
    switch (true) {
        case match(exports.KnownLndErrorDetails.InvoiceAlreadyPaid):
            return new lightning_2.LnAlreadyPaidError();
        case match(exports.KnownLndErrorDetails.UnableToFindRoute):
            return new lightning_2.RouteNotFoundError();
        case match(exports.KnownLndErrorDetails.UnknownNextPeer):
            return new lightning_2.UnknownNextPeerError();
        case match(exports.KnownLndErrorDetails.PaymentRejectedByDestination):
        case match(exports.KnownLndErrorDetails.UnknownPaymentHash):
            return new lightning_2.InvoiceExpiredOrBadPaymentHashError(paymentHash);
        case match(exports.KnownLndErrorDetails.PaymentAttemptsTimedOut):
            return new lightning_2.PaymentAttemptsTimedOutError();
        case match(exports.KnownLndErrorDetails.PaymentInTransition):
            return new lightning_2.PaymentInTransitionError(paymentHash);
        case match(exports.KnownLndErrorDetails.TemporaryChannelFailure):
            return new lightning_2.TemporaryChannelFailureError(paymentHash);
        case match(exports.KnownLndErrorDetails.InsufficientBalanceToAttemptPayment):
            return new lightning_2.InsufficientBalanceForLnPaymentError();
        default:
            return handleCommonLightningServiceErrors(err);
    }
};
const handleCommonLightningServiceErrors = (err) => {
    const errDetails = (0, utils_1.parseLndErrorDetails)(err);
    const match = (knownErrDetail) => knownErrDetail.test(errDetails);
    switch (true) {
        case match(exports.KnownLndErrorDetails.ConnectionDropped):
        case match(exports.KnownLndErrorDetails.NoConnectionEstablished):
            return new lightning_2.OffChainServiceUnavailableError();
        default:
            return new lightning_2.UnknownLightningServiceError(msgForUnknown(err));
    }
};
const handleCommonRouteNotFoundErrors = (err) => {
    const errDetails = (0, utils_1.parseLndErrorDetails)(err);
    const match = (knownErrDetail) => knownErrDetail.test(errDetails);
    switch (true) {
        case match(exports.KnownLndErrorDetails.ConnectionDropped):
        case match(exports.KnownLndErrorDetails.NoConnectionEstablished):
            return new lightning_2.OffChainServiceUnavailableError();
        default:
            return new lightning_2.UnknownRouteNotFoundError(msgForUnknown(err));
    }
};
const msgForUnknown = (err) => JSON.stringify({
    parsedLndErrorDetails: (0, utils_1.parseLndErrorDetails)(err),
    detailsFromLnd: err,
});
//# sourceMappingURL=index.js.map