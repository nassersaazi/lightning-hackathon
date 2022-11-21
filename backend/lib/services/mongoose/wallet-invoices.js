"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletInvoicesRepository = void 0;
const errors_1 = require("../../domain/errors");
const shared_1 = require("../../domain/shared");
const utils_1 = require("./utils");
const schema_1 = require("./schema");
const WalletInvoicesRepository = () => {
    const persistNew = async ({ paymentHash, secret, recipientWalletDescriptor, selfGenerated, pubkey, paid, usdAmount, }) => {
        try {
            const walletInvoice = await new schema_1.WalletInvoice({
                _id: paymentHash,
                secret,
                walletId: recipientWalletDescriptor.id,
                selfGenerated,
                pubkey,
                paid,
                cents: usdAmount ? Number(usdAmount.amount) : undefined,
                currency: recipientWalletDescriptor.currency,
            }).save();
            return walletInvoiceFromRaw(walletInvoice);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const markAsPaid = async (paymentHash) => {
        try {
            const walletInvoice = await schema_1.WalletInvoice.findOneAndUpdate({ _id: paymentHash }, { paid: true }, {
                new: true,
            });
            if (!walletInvoice) {
                return new errors_1.CouldNotFindWalletInvoiceError();
            }
            return walletInvoiceFromRaw(walletInvoice);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const findByPaymentHash = async (paymentHash) => {
        try {
            const walletInvoice = await schema_1.WalletInvoice.findOne({ _id: paymentHash });
            if (!walletInvoice) {
                return new errors_1.CouldNotFindWalletInvoiceError(paymentHash);
            }
            return walletInvoiceFromRaw(walletInvoice);
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    async function* yieldPending() {
        let pending;
        try {
            pending = schema_1.WalletInvoice.find({ paid: false }).cursor({
                batchSize: 100,
            });
        }
        catch (error) {
            return new errors_1.RepositoryError(error);
        }
        for await (const walletInvoice of pending) {
            yield walletInvoiceFromRaw(walletInvoice);
        }
    }
    const deleteByPaymentHash = async (paymentHash) => {
        try {
            const result = await schema_1.WalletInvoice.deleteOne({ _id: paymentHash });
            if (result.deletedCount === 0) {
                return new errors_1.CouldNotFindWalletInvoiceError(paymentHash);
            }
            return true;
        }
        catch (error) {
            return new errors_1.RepositoryError(error);
        }
    };
    const deleteUnpaidOlderThan = async (before) => {
        try {
            const result = await schema_1.WalletInvoice.deleteMany({
                timestamp: { $lt: before },
                paid: false,
            });
            return result.deletedCount;
        }
        catch (error) {
            return new errors_1.RepositoryError(error);
        }
    };
    return {
        persistNew,
        markAsPaid,
        findByPaymentHash,
        yieldPending,
        deleteByPaymentHash,
        deleteUnpaidOlderThan,
    };
};
exports.WalletInvoicesRepository = WalletInvoicesRepository;
const walletInvoiceFromRaw = (result) => ({
    paymentHash: result._id,
    secret: result.secret,
    recipientWalletDescriptor: {
        id: result.walletId,
        currency: result.currency,
    },
    selfGenerated: result.selfGenerated,
    pubkey: result.pubkey,
    paid: result.paid,
    usdAmount: result.cents ? (0, shared_1.UsdPaymentAmount)(BigInt(result.cents)) : undefined,
});
//# sourceMappingURL=wallet-invoices.js.map