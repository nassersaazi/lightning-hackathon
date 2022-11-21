"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionMetadata = exports.Transaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ledger_1 = require("../../domain/ledger");
const medici_1 = require("medici");
// TODO migration:
// rename type: on_us to intraledger
const Schema = mongoose_1.default.Schema;
const ledgerTransactionTypes = Object.values(ledger_1.LedgerTransactionType);
const transactionSchema = new Schema({
    hash: {
        type: Schema.Types.String,
        ref: "invoiceusers",
        // TODO: not always, use another hashOnchain?
    },
    // used for escrow transaction, to know which channel this transaction is associated with
    // FIXME? hash is currently used for onchain tx but txid should be used instead?
    // an onchain output is deterministically represented by hash of tx + vout
    txid: String,
    type: {
        required: true,
        type: String,
        enum: ledgerTransactionTypes,
    },
    // used to denote confirmation status of on and off chain txn
    // for sending payment on lightning, pending will be true in case of timeout
    // for sending payment on chain, pending will be true until the transaction get mined
    // pending is not used for receiving transaction.
    pending: {
        type: Boolean,
        required: true,
    },
    currency: {
        type: String,
        enum: ["USD", "BTC"],
        required: true,
    },
    fee: {
        type: Number,
        default: 0,
    },
    // for fee updated
    feeKnownInAdvance: {
        type: Boolean,
    },
    related_journal: Schema.Types.ObjectId,
    // for onchain transactions.
    payee_addresses: [String],
    memoPayer: String,
    // not used for accounting but used for usd/sats equivalent
    usd: Number,
    sats: Number,
    feeUsd: {
        // TODO: should be renamed feeDisplayCurrency
        type: Number,
        default: 0,
    },
    satsAmount: Number,
    centsAmount: Number,
    satsFee: {
        type: Number,
        default: 0,
    },
    centsFee: {
        type: Number,
        default: 0,
    },
    displayAmount: Number,
    displayFee: {
        type: Number,
        default: 0,
    },
    displayCurrency: {
        type: String,
        enum: ["USD", "BTC", "CRC"],
    },
    // when transaction with on_us transaction, this is the other party username
    // TODO: refactor, define username as a type so that every property that should be an username can inherit from those parameters
    username: {
        type: String,
        match: [
            /(?!^(1|3|bc1|lnbc1))^[0-9a-z_]+$/i,
            "Username can only have alphabets, numbers and underscores",
        ],
        minlength: 3,
        maxlength: 50,
    },
    // which lnd node this transaction relates to
    pubkey: String,
    // original property from medici
    credit: Number,
    debit: Number,
    meta: Schema.Types.Mixed,
    datetime: Date,
    account_path: [String],
    accounts: String,
    book: String,
    memo: String,
    _journal: {
        type: Schema.Types.ObjectId,
        ref: "Medici_Journal",
    },
    timestamp: Date,
    voided: Boolean,
    void_reason: String,
    // The journal that this is voiding, if any
    _original_journal: {
        type: Schema.Types.ObjectId,
        ref: "Medici_Journal",
    },
}, { id: false, versionKey: false, timestamps: false });
//indexes used by our queries
transactionSchema.index({ accounts: 1, type: 1, timestamp: -1 });
transactionSchema.index({ type: 1, pending: 1, account_path: 1 });
transactionSchema.index({ account_path: 1 });
transactionSchema.index({ hash: 1 });
(0, medici_1.setTransactionSchema)(transactionSchema, undefined, { defaultIndexes: true });
exports.Transaction = mongoose_1.default.model("Medici_Transaction", transactionSchema);
const transactionMetadataSchema = new Schema({
    hash: String,
    revealedPreImage: {
        type: String,
        index: true,
    },
    swap: Schema.Types.Mixed,
}, { id: false });
transactionMetadataSchema.index({
    hash: 1,
});
exports.TransactionMetadata = mongoose_1.default.model("Medici_Transaction_Metadata", transactionMetadataSchema);
//# sourceMappingURL=schema.js.map