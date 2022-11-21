"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const me_1 = __importDefault(require("../root/query/me"));
const globals_1 = __importDefault(require("../root/query/globals"));
const btc_price_1 = __importDefault(require("../root/query/btc-price"));
const btc_price_list_1 = __importDefault(require("../root/query/btc-price-list"));
const quiz_questions_1 = __importDefault(require("../root/query/quiz-questions"));
const mobile_versions_1 = __importDefault(require("../root/query/mobile-versions"));
const on_chain_tx_fee_query_1 = __importDefault(require("../root/query/on-chain-tx-fee-query"));
const username_available_1 = __importDefault(require("../root/query/username-available"));
const business_map_markers_1 = __importDefault(require("../root/query/business-map-markers"));
const account_default_wallet_1 = __importDefault(require("../root/query/account-default-wallet"));
const account_default_wallet_id_1 = __importDefault(require("../root/query/account-default-wallet-id"));
const ln_invoice_payment_status_1 = __importDefault(require("../root/query/ln-invoice-payment-status"));
const fields = {
    globals: globals_1.default,
    me: me_1.default,
    usernameAvailable: username_available_1.default,
    userDefaultWalletId: account_default_wallet_id_1.default,
    accountDefaultWallet: account_default_wallet_1.default,
    businessMapMarkers: business_map_markers_1.default,
    mobileVersions: mobile_versions_1.default,
    quizQuestions: quiz_questions_1.default,
    btcPrice: btc_price_1.default,
    btcPriceList: btc_price_list_1.default,
    onChainTxFee: on_chain_tx_fee_query_1.default,
    lnInvoicePaymentStatus: ln_invoice_payment_status_1.default,
};
const QueryType = index_1.GT.Object({
    name: "Query",
    fields,
});
exports.default = QueryType;
//# sourceMappingURL=queries.js.map