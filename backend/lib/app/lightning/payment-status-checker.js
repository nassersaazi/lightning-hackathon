"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatusChecker = void 0;
const lightning_1 = require("../../domain/bitcoin/lightning");
const ledger_1 = require("../../services/ledger");
const PaymentStatusChecker = async (uncheckedPaymentRequest) => {
    const decodedInvoice = (0, lightning_1.decodeInvoice)(uncheckedPaymentRequest);
    if (decodedInvoice instanceof Error)
        return decodedInvoice;
    const { paymentHash } = decodedInvoice;
    return {
        paymentHash,
        invoiceIsPaid: async () => {
            const ledger = (0, ledger_1.LedgerService)();
            const recorded = await ledger.isLnTxRecorded(paymentHash);
            if (recorded instanceof Error)
                return recorded;
            return recorded;
        },
    };
};
exports.PaymentStatusChecker = PaymentStatusChecker;
//# sourceMappingURL=payment-status-checker.js.map