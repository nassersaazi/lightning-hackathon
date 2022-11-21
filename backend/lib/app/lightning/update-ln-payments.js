"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLnPayments = void 0;
const lightning_1 = require("../../domain/bitcoin/lightning");
const lnd_1 = require("../../services/lnd");
const logger_1 = require("../../services/logger");
const ln_payments_1 = require("../../services/mongoose/ln-payments");
const tracing_1 = require("../../services/tracing");
const updateLnPayments = async () => {
    let processedLnPaymentsHashes = [];
    const incompleteLnPayments = await (0, ln_payments_1.LnPaymentsRepository)().listIncomplete();
    if (incompleteLnPayments instanceof Error)
        return incompleteLnPayments;
    const pubkeysFromPayments = new Set(incompleteLnPayments.map((p) => p.sentFromPubkey));
    const lndService = (0, lnd_1.LndService)();
    if (lndService instanceof Error)
        return lndService;
    const listFns = [
        lndService.listSettledPayments,
        lndService.listFailedPayments,
    ];
    const pubkeys = lndService
        .listActivePubkeys()
        .filter((pubkey) => pubkeysFromPayments.has(pubkey));
    for (const idx in pubkeys)
        (0, tracing_1.addAttributesToCurrentSpan)({ [`pubkey.${idx}`]: pubkeys[idx] });
    for (const listFn of listFns) {
        for (const pubkey of pubkeys) {
            processedLnPaymentsHashes = await updateLnPaymentsByFunction({
                processedLnPaymentsHashes,
                incompleteLnPayments,
                pubkey,
                listFn,
            });
        }
    }
    return true;
};
exports.updateLnPayments = updateLnPayments;
const updateLnPaymentsByFunction = async ({ processedLnPaymentsHashes, incompleteLnPayments, pubkey, listFn, }) => {
    let after = undefined;
    let updatedProcessedHashes = processedLnPaymentsHashes;
    while (updatedProcessedHashes.length < incompleteLnPayments.length && after !== false) {
        const results = await (0, tracing_1.asyncRunInSpan)("app.lightning.updateLnPaymentsPaginated", {
            attributes: {
                [tracing_1.SemanticAttributes.CODE_FUNCTION]: "updateLnPaymentsPaginated",
                [tracing_1.SemanticAttributes.CODE_NAMESPACE]: "app.lightning",
                [`${tracing_1.SemanticAttributes.CODE_FUNCTION}.params.cursor`]: String(after),
                [`${tracing_1.SemanticAttributes.CODE_FUNCTION}.params.listPaymentsMethod`]: listFn.name,
                [`${tracing_1.SemanticAttributes.CODE_FUNCTION}.params.pubkey`]: pubkey,
                [`${tracing_1.SemanticAttributes.CODE_FUNCTION}.params.totalIncomplete`]: incompleteLnPayments.length,
                [`${tracing_1.SemanticAttributes.CODE_FUNCTION}.params.processedCount`]: updatedProcessedHashes.length,
            },
        }, async () => {
            if (after === false)
                return new lightning_1.UnknownLightningServiceError();
            return updateLnPaymentsPaginated({
                processedLnPaymentsHashes: updatedProcessedHashes,
                incompleteLnPayments,
                after,
                pubkey,
                listFn,
            });
        });
        if (results instanceof Error)
            break;
        ({ after, processedLnPaymentsHashes: updatedProcessedHashes } = results);
    }
    return updatedProcessedHashes;
};
const updateLnPaymentsPaginated = async ({ processedLnPaymentsHashes, incompleteLnPayments, after, pubkey, listFn, }) => {
    // Fetch from Lightning service
    const results = await listFn({
        pubkey,
        after,
    });
    if (results instanceof Error) {
        logger_1.baseLogger.error({ error: results }, `Could not fetch payments for pubkey ${pubkey}`);
        return results;
    }
    if (after === results.endCursor)
        return new lightning_1.UnknownLightningServiceError();
    const updatedAfter = results.endCursor;
    // Update LnPayments repository
    for (const payment of results.lnPayments) {
        const persistedPaymentLookup = incompleteLnPayments.find((elem) => elem.paymentHash === payment.paymentHash);
        if (!persistedPaymentLookup)
            return { after: updatedAfter, processedLnPaymentsHashes };
        persistedPaymentLookup.createdAt = payment.createdAt;
        persistedPaymentLookup.status = payment.status;
        persistedPaymentLookup.milliSatsAmount = payment.milliSatsAmount;
        persistedPaymentLookup.roundedUpAmount = payment.roundedUpAmount;
        persistedPaymentLookup.confirmedDetails = payment.confirmedDetails;
        persistedPaymentLookup.attempts = payment.attempts;
        persistedPaymentLookup.isCompleteRecord = true;
        const updatedPaymentLookup = await (0, ln_payments_1.LnPaymentsRepository)().update(persistedPaymentLookup);
        if (updatedPaymentLookup instanceof Error) {
            logger_1.baseLogger.error({ error: updatedPaymentLookup }, "Could not update LnPayments repository");
            return { after: updatedAfter, processedLnPaymentsHashes };
        }
        processedLnPaymentsHashes.push(payment.paymentHash);
    }
    return { after: updatedAfter, processedLnPaymentsHashes };
};
//# sourceMappingURL=update-ln-payments.js.map