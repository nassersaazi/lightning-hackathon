"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LnPayment = void 0;
const lightning_1 = require("../../domain/bitcoin/lightning");
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const confirmedDetailsSchema = new Schema({
    confirmedAt: {
        type: Date,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    revealedPreImage: {
        type: String,
        required: true,
    },
    roundedUpFee: {
        type: Number,
        required: true,
    },
    milliSatsFee: {
        type: Number,
        required: true,
    },
    hopPubkeys: [String],
});
const paymentAttemptSchema = Schema.Types.Mixed;
const paymentSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: Object.values(lightning_1.PaymentStatus),
        required: true,
    },
    paymentHash: {
        type: String,
        index: true,
        unique: true,
        required: true,
    },
    paymentRequest: String,
    sentFromPubkey: {
        type: String,
        required: true,
    },
    milliSatsAmount: Number,
    roundedUpAmount: Number,
    confirmedDetails: confirmedDetailsSchema,
    attempts: [paymentAttemptSchema],
    isCompleteRecord: {
        type: Boolean,
        default: false,
    },
});
exports.LnPayment = mongoose_1.default.model("LnPayment", paymentSchema);
//# sourceMappingURL=schema.js.map