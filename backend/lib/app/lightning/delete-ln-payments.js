"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLnPaymentsBefore = void 0;
const lightning_1 = require("../../domain/bitcoin/lightning");
const errors_1 = require("../../domain/errors");
const lnd_1 = require("../../services/lnd");
const mongoose_1 = require("../../services/mongoose");
const tracing_1 = require("../../services/tracing");
const deleteLnPaymentsBefore = async (timestamp) => {
    const paymentHashesBefore = await listAllPaymentsBefore(timestamp);
    for await (const paymentHash of paymentHashesBefore) {
        if (paymentHash instanceof Error)
            return paymentHash;
        await checkAndDeletePaymentForHash(paymentHash);
    }
    return true;
};
exports.deleteLnPaymentsBefore = deleteLnPaymentsBefore;
const checkAndDeletePaymentForHash = async ({ paymentHash, pubkey, }) => (0, tracing_1.asyncRunInSpan)("app.lightning.checkAndDeletePaymentForHash", {
    attributes: {
        [tracing_1.SemanticAttributes.CODE_FUNCTION]: "checkAndDeletePaymentForHash",
        [tracing_1.SemanticAttributes.CODE_NAMESPACE]: "lightning",
        paymentHash,
        pubkey,
        deleted: false,
    },
}, async () => {
    const lnPayment = await (0, mongoose_1.LnPaymentsRepository)().findByPaymentHash(paymentHash);
    if (lnPayment instanceof Error) {
        if (lnPayment instanceof errors_1.CouldNotFindLnPaymentFromHashError) {
            // Attempt to get paymentRequest from lnd
            const lndService = (0, lnd_1.LndService)();
            if (lndService instanceof Error)
                return lndService;
            const lnPaymentLookup = await lndService.lookupPayment({ pubkey, paymentHash });
            if (lnPaymentLookup instanceof Error)
                return lnPaymentLookup;
            const { paymentRequest } = "createdAt" in lnPaymentLookup
                ? lnPaymentLookup
                : { paymentRequest: undefined };
            await (0, mongoose_1.LnPaymentsRepository)().persistNew({
                paymentHash,
                paymentRequest,
                sentFromPubkey: pubkey,
            });
            (0, tracing_1.addAttributesToCurrentSpan)({ existedInRepository: false });
            return false;
        }
        (0, tracing_1.addAttributesToCurrentSpan)({ ["existedInRepository.undefined"]: true });
        return lnPayment;
    }
    (0, tracing_1.addAttributesToCurrentSpan)({
        existedInRepository: true,
        isCompleteRecord: lnPayment.isCompleteRecord,
    });
    if (!lnPayment.isCompleteRecord)
        return false;
    const lndService = (0, lnd_1.LndService)();
    if (lndService instanceof Error)
        return lndService;
    const deleted = lndService.deletePaymentByHash({ paymentHash, pubkey });
    if (deleted instanceof Error)
        return deleted;
    (0, tracing_1.addAttributesToCurrentSpan)({ deleted: true });
    return true;
});
const listAllPaymentsBefore = async function* (timestamp) {
    const lndService = (0, lnd_1.LndService)();
    if (lndService instanceof Error) {
        yield lndService;
        return;
    }
    const pubkeys = lndService.listActivePubkeys();
    const listFns = [
        lndService.listSettledPayments,
        lndService.listFailedPayments,
    ];
    for (const pubkey of pubkeys) {
        for (const listFn of listFns) {
            let after = undefined;
            while (after !== false) {
                const result = await listFn({
                    after,
                    pubkey,
                });
                if (result instanceof Error) {
                    yield result;
                    return;
                }
                if (after === result.endCursor) {
                    yield new lightning_1.UnknownLightningServiceError();
                    return;
                }
                after = result.endCursor;
                for (const payment of result.lnPayments) {
                    if (payment.createdAt < timestamp) {
                        yield { paymentHash: payment.paymentHash, pubkey };
                    }
                }
            }
        }
    }
};
//# sourceMappingURL=delete-ln-payments.js.map