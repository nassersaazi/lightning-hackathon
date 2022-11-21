"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentFlowState = exports.PhoneCode = exports.User = exports.Wallet = exports.WalletInvoice = exports.DbMetadata = void 0;
const crypto_1 = __importDefault(require("crypto"));
const _config_1 = require("../../config/index");
const accounts_1 = require("../../domain/accounts");
const wallets_1 = require("../../domain/wallets");
const shared_1 = require("../../domain/shared");
const users_1 = require("../../domain/users");
const mongoose_1 = __importDefault(require("mongoose"));
// TODO migration:
// rename InvoiceUser collection to walletInvoice
// mongoose.set("debug", true)
const Schema = mongoose_1.default.Schema;
const dbMetadataSchema = new Schema({
    routingFeeLastEntry: Date, // TODO: rename to routingRevenueLastEntry
});
exports.DbMetadata = mongoose_1.default.model("DbMetadata", dbMetadataSchema);
const walletInvoiceSchema = new Schema({
    _id: { type: String },
    walletId: {
        required: true,
        type: String,
        validate: {
            validator: function (v) {
                return v.match(wallets_1.WalletIdRegex);
            },
        },
    },
    // Usd quote. sats is attached in the invoice directly.
    // this is the option price given by the dealer
    // is optional, BTC wallet or invoice on USD with no amount doesn't have cents
    cents: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value",
        },
    },
    secret: {
        required: true,
        type: String,
        length: 64,
    },
    currency: {
        required: true,
        type: String,
        enum: Object.values(shared_1.WalletCurrency),
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    selfGenerated: {
        type: Boolean,
        default: true,
    },
    pubkey: {
        type: String,
        required: true,
    },
    paid: {
        type: Boolean,
        default: false,
    },
});
walletInvoiceSchema.index({ walletId: 1, paid: 1 });
exports.WalletInvoice = mongoose_1.default.model("InvoiceUser", walletInvoiceSchema);
const feesConfig = (0, _config_1.getFeesConfig)();
const WalletSchema = new Schema({
    id: {
        type: String,
        index: true,
        unique: true,
        required: true,
        default: () => crypto_1.default.randomUUID(),
    },
    _accountId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    type: {
        type: String,
        enum: Object.values(wallets_1.WalletType),
        required: true,
        default: wallets_1.WalletType.Checking,
    },
    currency: {
        type: String,
        enum: Object.values(shared_1.WalletCurrency),
        required: true,
        default: shared_1.WalletCurrency.Btc,
    },
    onchain: {
        type: [
            {
                pubkey: {
                    type: String,
                    required: true,
                },
                address: {
                    type: String,
                    // TODO: index?
                    required: true,
                },
            },
        ],
        default: [],
    },
});
exports.Wallet = mongoose_1.default.model("Wallet", WalletSchema);
const UserSchema = new Schema({
    depositFeeRatio: {
        type: Number,
        default: feesConfig.depositFeeVariable,
        min: 0,
        max: 1,
    },
    withdrawFee: {
        type: Number,
        default: feesConfig.withdrawDefaultMin,
        min: 0,
    },
    lastConnection: Date,
    lastIPs: {
        type: [
            {
                ip: String,
                provider: String,
                country: String,
                isoCode: String,
                region: String,
                city: String,
                //using Type instead of type due to its special status in mongoose
                Type: String,
                asn: String,
                proxy: Boolean,
                firstConnection: {
                    type: Date,
                    default: Date.now,
                },
                lastConnection: Date,
            },
        ],
        default: [],
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    earn: {
        type: [String],
        default: [],
    },
    role: {
        type: String,
        // FIXME: role is a mix between 2 things here
        // there can be many users and editors
        // there can be only one dealer, bankowner and funder
        // so we may want different property to differentiate those
        enum: ["user", "editor", "dealer", "bankowner", "funder"],
        required: true,
        default: "user",
        // TODO : enfore the fact there can be only one dealer/bankowner/funder
    },
    level: {
        type: Number,
        enum: _config_1.levels,
        default: 1,
    },
    // TODO: refactor, have phone and twilio metadata in the same sub-object.
    phone: {
        type: String,
        index: true,
        unique: true,
        sparse: true,
    },
    twilio: {
        // TODO: rename to PhoneMetadata
        carrier: {
            error_code: String,
            mobile_country_code: String,
            mobile_network_code: String,
            name: String,
            type: {
                types: String,
                enum: ["landline", "voip", "mobile"],
            },
        },
        countryCode: String,
    },
    kratosUserId: {
        type: String,
        index: true,
        unique: true,
        sparse: true,
    },
    username: {
        type: String,
        match: [accounts_1.UsernameRegex, "Username can only have alphabets, numbers and underscores"],
        minlength: 3,
        maxlength: 50,
        index: {
            unique: true,
            collation: { locale: "en", strength: 2 },
            partialFilterExpression: { username: { $type: "string" } },
        },
    },
    deviceToken: {
        type: [String],
        default: [],
    },
    contactEnabled: {
        type: Boolean,
        default: true,
    },
    contacts: {
        type: [
            {
                id: {
                    type: String,
                    collation: { locale: "en", strength: 2 },
                },
                name: {
                    type: String,
                    // TODO: add constraint here
                },
                transactionsCount: {
                    type: Number,
                    default: 1,
                },
            },
        ],
        default: [],
    },
    language: {
        type: String,
        enum: [...users_1.Languages, ""],
        default: "",
    },
    // firstName,
    // lastName,
    // activated,
    // etc
    title: {
        type: String,
        minlength: 3,
        maxlength: 100,
    },
    coordinates: {
        type: {
            latitude: {
                type: Number,
            },
            longitude: {
                type: Number,
            },
        },
    },
    statusHistory: {
        type: [
            {
                status: {
                    type: String,
                    required: true,
                    enum: Object.values(accounts_1.AccountStatus),
                },
                updatedAt: {
                    type: Date,
                    default: Date.now,
                    required: true,
                },
                updatedByUserId: {
                    type: Schema.Types.ObjectId,
                    ref: "Account",
                    required: false,
                },
                comment: {
                    type: String,
                    required: false,
                },
            },
        ],
        default: [
            { status: (0, _config_1.getDefaultAccountsConfig)().initialStatus, comment: "Initial Status" },
        ],
    },
    defaultWalletId: {
        type: String,
        index: true,
    },
}, { id: false });
UserSchema.index({
    title: 1,
    coordinates: 1,
});
exports.User = mongoose_1.default.model("Account", UserSchema);
// TODO: this DB should be capped.
const PhoneCodeSchema = new Schema({
    created_at: {
        type: Date,
        default: Date.now,
        required: true,
    },
    phone: {
        // TODO we should store country as a separate string
        type: String,
        required: true,
    },
    code: {
        type: Number,
        required: true,
    },
});
exports.PhoneCode = mongoose_1.default.model("PhoneCode", PhoneCodeSchema);
const paymentFlowStateSchema = new Schema({
    senderWalletId: { type: String, required: true },
    senderWalletCurrency: { type: String, required: true },
    senderAccountId: { type: String, required: true },
    settlementMethod: { type: String, required: true },
    paymentInitiationMethod: { type: String, required: true },
    paymentHash: String,
    intraLedgerHash: String,
    createdAt: { type: Date, required: true },
    paymentSentAndPending: { type: Boolean, required: true },
    descriptionFromInvoice: String,
    btcPaymentAmount: { type: Number, required: true },
    usdPaymentAmount: { type: Number, required: true },
    inputAmount: { type: Number, required: true },
    btcProtocolFee: { type: Number, required: true },
    usdProtocolFee: { type: Number, required: true },
    recipientWalletId: String,
    recipientWalletCurrency: String,
    recipientAccountId: String,
    recipientPubkey: String,
    recipientUsername: String,
    outgoingNodePubkey: String,
    cachedRoute: Schema.Types.Mixed,
}, { id: false });
paymentFlowStateSchema.index({
    paymentHash: 1,
});
exports.PaymentFlowState = mongoose_1.default.model("Payment_Flow_State", paymentFlowStateSchema);
//# sourceMappingURL=schema.js.map