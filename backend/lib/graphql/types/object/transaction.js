"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionConnection = void 0;
const dedent_1 = __importDefault(require("dedent"));
const index_1 = require("../../index");
const connections_1 = require("../../connections");
const _config_1 = require("../../../config/index");
const memo_1 = __importDefault(require("../scalar/memo"));
const initiation_via_1 = __importDefault(require("../abstract/initiation-via"));
const settlement_via_1 = __importDefault(require("../abstract/settlement-via"));
const timestamp_1 = __importDefault(require("../scalar/timestamp"));
const tx_direction_1 = __importStar(require("../scalar/tx-direction"));
const tx_status_1 = __importDefault(require("../scalar/tx-status"));
const signed_amount_1 = __importDefault(require("../scalar/signed-amount"));
const wallet_currency_1 = __importDefault(require("../scalar/wallet-currency"));
const price_1 = __importDefault(require("./price"));
const Transaction = index_1.GT.Object({
    name: "Transaction",
    description: (0, dedent_1.default) `Give details about an individual transaction.
  Galoy have a smart routing system which is automatically
  settling intraledger when both the payer and payee use the same wallet
  therefore it's possible the transactions is being initiated onchain
  or with lightning but settled intraledger.`,
    fields: () => ({
        id: {
            type: index_1.GT.NonNullID,
        },
        initiationVia: {
            type: index_1.GT.NonNull(initiation_via_1.default),
            description: "From which protocol the payment has been initiated.",
        },
        settlementVia: {
            type: index_1.GT.NonNull(settlement_via_1.default),
            description: "To which protocol the payment has settled on.",
        },
        settlementAmount: {
            type: index_1.GT.NonNull(signed_amount_1.default),
            description: "Amount of the settlement currency sent or received.",
        },
        settlementFee: {
            type: index_1.GT.NonNull(signed_amount_1.default),
        },
        settlementPrice: {
            type: index_1.GT.NonNull(price_1.default),
            resolve: (source) => {
                const displayCurrencyPerSettlementCurrencyUnitInCents = source.displayCurrencyPerSettlementCurrencyUnit * 100;
                return {
                    formattedAmount: displayCurrencyPerSettlementCurrencyUnitInCents.toString(),
                    base: Math.round(displayCurrencyPerSettlementCurrencyUnitInCents *
                        10 ** _config_1.SAT_PRICE_PRECISION_OFFSET),
                    offset: _config_1.SAT_PRICE_PRECISION_OFFSET,
                    currencyUnit: "USDCENT",
                };
            },
            description: "Price in USDCENT/SETTLEMENTUNIT at time of settlement.",
        },
        settlementCurrency: {
            type: index_1.GT.NonNull(wallet_currency_1.default),
            description: "Wallet currency for transaction.",
        },
        direction: {
            type: index_1.GT.NonNull(tx_direction_1.default),
            resolve: (source) => source.settlementAmount > 0 ? tx_direction_1.txDirectionValues.RECEIVE : tx_direction_1.txDirectionValues.SEND,
        },
        status: {
            type: index_1.GT.NonNull(tx_status_1.default),
        },
        memo: {
            type: memo_1.default,
        },
        createdAt: {
            type: index_1.GT.NonNull(timestamp_1.default),
        },
    }),
});
exports.TransactionConnection = (0, connections_1.connectionDefinitions)({
    nodeType: Transaction,
}).connectionType;
exports.default = Transaction;
//# sourceMappingURL=transaction.js.map