"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateToLedgerJournal = exports.persistAndReturnEntry = void 0;
const errors_1 = require("./domain/errors");
const services_1 = require("./services");
const txMetadataRepo = (0, services_1.TransactionsMetadataRepository)();
const persistAndReturnEntry = async ({ entry, hash, revealedPreImage, }) => {
    try {
        const savedEntry = await entry.commit();
        const journalEntry = (0, exports.translateToLedgerJournal)(savedEntry);
        const txsMetadataToPersist = journalEntry.transactionIds.map((id) => ({
            id,
            hash,
            revealedPreImage,
        }));
        txMetadataRepo.persistAll(txsMetadataToPersist);
        return journalEntry;
    }
    catch (err) {
        return new errors_1.UnknownLedgerError(err);
    }
};
exports.persistAndReturnEntry = persistAndReturnEntry;
// @ts-ignore-next-line no-implicit-any error
const translateToLedgerJournal = (savedEntry) => ({
    journalId: savedEntry._id.toString(),
    voided: savedEntry.voided,
    // @ts-ignore-next-line no-implicit-any error
    transactionIds: savedEntry._transactions.map((id) => id.toString()),
});
exports.translateToLedgerJournal = translateToLedgerJournal;
//# sourceMappingURL=helpers.js.map