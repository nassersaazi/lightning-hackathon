"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupInvoiceByHash = void 0;
const lnd_1 = require("../../services/lnd");
const mongoose_1 = require("../../services/mongoose");
const errors_1 = require("../../domain/errors");
const lookupInvoiceByHash = async (paymentHash) => {
    const lndService = (0, lnd_1.LndService)();
    if (lndService instanceof Error)
        return lndService;
    const invoicesRepo = (0, mongoose_1.WalletInvoicesRepository)();
    const walletInvoice = await invoicesRepo.findByPaymentHash(paymentHash);
    if (walletInvoice instanceof errors_1.RepositoryError)
        return walletInvoice;
    const { pubkey } = walletInvoice;
    return lndService.lookupInvoice({ paymentHash, pubkey });
};
exports.lookupInvoiceByHash = lookupInvoiceByHash;
//# sourceMappingURL=lookup-invoice-by-hash.js.map