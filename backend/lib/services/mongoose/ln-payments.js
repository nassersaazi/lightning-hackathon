"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LnPaymentsRepository = void 0;
const bitcoin_1 = require("../../domain/bitcoin");
const errors_1 = require("../../domain/errors");
const schema_1 = require("../lnd/schema");
const utils_1 = require("./utils");
const LnPaymentsRepository = () => {
    const findByPaymentHash = async (paymentHash) => {
        try {
            const result = await schema_1.LnPayment.findOne({ paymentHash });
            if (!result) {
                return new errors_1.CouldNotFindLnPaymentFromHashError(paymentHash);
            }
            return lnPaymentFromRaw(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const listIncomplete = async () => {
        try {
            const result = await schema_1.LnPayment.find({
                isCompleteRecord: false,
            });
            return result.map(lnPaymentFromRaw);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const persistNew = async (payment) => {
        try {
            const result = await schema_1.LnPayment.findOneAndUpdate({ paymentHash: payment.paymentHash }, payment, { upsert: true, new: true, setDefaultsOnInsert: true });
            return result.isCompleteRecord
                ? lnPaymentFromRaw(result)
                : lnPaymentPartialFromRaw(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const update = async (payment) => {
        try {
            const result = await schema_1.LnPayment.findOneAndUpdate({ paymentHash: payment.paymentHash }, payment, { new: true });
            if (!result)
                return new errors_1.CouldNotFindLnPaymentFromHashError();
            return lnPaymentFromRaw(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    return {
        findByPaymentHash,
        listIncomplete,
        persistNew,
        update,
    };
};
exports.LnPaymentsRepository = LnPaymentsRepository;
const lnPaymentFromRaw = (result) => ({
    createdAt: result.createdAt,
    status: result.status,
    paymentHash: result.paymentHash,
    paymentRequest: result.paymentRequest,
    sentFromPubkey: result.sentFromPubkey,
    milliSatsAmount: (0, bitcoin_1.toMilliSatsFromNumber)(result.milliSatsAmount),
    roundedUpAmount: (0, bitcoin_1.toSats)(result.roundedUpAmount),
    confirmedDetails: result.confirmedDetails
        ? {
            confirmedAt: result.confirmedDetails.confirmedAt,
            destination: result.confirmedDetails.destination,
            revealedPreImage: result.confirmedDetails.revealedPreImage,
            roundedUpFee: result.confirmedDetails.roundedUpFee,
            milliSatsFee: result.confirmedDetails.milliSatsFee,
            hopPubkeys: result.confirmedDetails.hopPubkeys,
        }
        : undefined,
    attempts: result.attempts,
    isCompleteRecord: result.isCompleteRecord,
});
const lnPaymentPartialFromRaw = (result) => ({
    paymentHash: result.paymentHash,
    paymentRequest: result.paymentRequest,
    sentFromPubkey: result.sentFromPubkey,
});
//# sourceMappingURL=ln-payments.js.map