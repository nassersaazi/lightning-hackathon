"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const all_levels_1 = __importDefault(require("./root/query/all-levels"));
const lightning_invoice_1 = __importDefault(require("./root/query/lightning-invoice"));
const lightning_payment_1 = __importDefault(require("./root/query/lightning-payment"));
const transaction_by_id_1 = __importDefault(require("./root/query/transaction-by-id"));
const transactions_by_hash_1 = __importDefault(require("./root/query/transactions-by-hash"));
const account_details_by_phone_1 = __importDefault(require("./root/query/account-details-by-phone"));
const account_details_by_username_1 = __importDefault(require("./root/query/account-details-by-username"));
const all_walletids_1 = __importDefault(require("./root/query/all-walletids"));
const wallet_1 = __importDefault(require("./root/query/wallet"));
const QueryType = index_1.GT.Object({
    name: "Query",
    fields: () => ({
        allLevels: all_levels_1.default,
        accountDetailsByUserPhone: account_details_by_phone_1.default,
        accountDetailsByUsername: account_details_by_username_1.default,
        transactionById: transaction_by_id_1.default,
        transactionsByHash: transactions_by_hash_1.default,
        lightningInvoice: lightning_invoice_1.default,
        lightningPayment: lightning_payment_1.default,
        listWalletIds: all_walletids_1.default,
        wallet: wallet_1.default,
    }),
});
exports.default = QueryType;
//# sourceMappingURL=queries.js.map