"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsMetadataRepository = void 0;
const errors_1 = require("../../../domain/errors");
const ledger_1 = require("../../../domain/ledger");
const utils_1 = require("../../mongoose/utils");
const schema_1 = require("../schema");
const TransactionsMetadataRepository = () => {
    const updateByHash = async (ledgerTxMetadata) => {
        const { hash, ...metadata } = ledgerTxMetadata;
        try {
            const result = await schema_1.TransactionMetadata.updateMany({ hash }, metadata);
            const success = result.modifiedCount > 0;
            if (!success) {
                return new errors_1.NoTransactionToUpdateError();
            }
            return true;
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const persistAll = async (ledgerTxsMetadata) => {
        if (ledgerTxsMetadata.length === 0)
            return [];
        try {
            const ledgerTxsMetadataPersist = ledgerTxsMetadata.map((txMetadata) => {
                const { id, ...metadata } = txMetadata;
                return { _id: (0, utils_1.toObjectId)(id), ...metadata };
            });
            const result = await schema_1.TransactionMetadata.insertMany(ledgerTxsMetadataPersist);
            return result.map((txRecord) => translateToLedgerTxMetadata(txRecord));
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findById = async (id) => {
        try {
            const result = await schema_1.TransactionMetadata.findOne({
                _id: (0, utils_1.toObjectId)(id),
            });
            if (!result)
                return new ledger_1.CouldNotFindTransactionMetadataError();
            return translateToLedgerTxMetadata(result);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findByHash = async (hash) => {
        try {
            const result = await schema_1.TransactionMetadata.findOne({
                hash,
            });
            if (!result)
                return new ledger_1.CouldNotFindTransactionMetadataError();
            return translateToLedgerTxMetadata(result);
        }
        catch (err) {
            return new errors_1.UnknownRepositoryError(err);
        }
    };
    return {
        updateByHash,
        persistAll,
        findById,
        findByHash,
    };
};
exports.TransactionsMetadataRepository = TransactionsMetadataRepository;
const translateToLedgerTxMetadata = (txMetadata) => ({
    id: (0, utils_1.fromObjectId)(txMetadata._id),
    hash: txMetadata.hash || undefined,
    revealedPreImage: txMetadata.revealedPreImage || undefined,
});
//# sourceMappingURL=transactions-metadata.js.map