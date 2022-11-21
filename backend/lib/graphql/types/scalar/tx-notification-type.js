"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const TxNotificationType = index_1.GT.Enum({
    name: "TxNotificationType",
    values: {
        OnchainReceipt: { value: "onchain_receipt" },
        OnchainReceiptPending: { value: "onchain_receipt_pending" },
        OnchainPayment: { value: "onchain_payment" },
        LnInvoicePaid: { value: "paid-invoice" },
        IntraLedgerReceipt: { value: "intra_ledger_receipt" },
        IntraLedgerPayment: { value: "intra_ledger_payment" },
    },
});
exports.default = TxNotificationType;
//# sourceMappingURL=tx-notification-type.js.map