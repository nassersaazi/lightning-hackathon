"use strict";
// an accounting reminder:
// https://en.wikipedia.org/wiki/Double-entry_bookkeeping
Object.defineProperty(exports, "__esModule", { value: true });
exports.coldStorageAccountDescriptor = exports.lndLedgerAccountDescriptor = exports.coldStorageAccountId = exports.lndLedgerAccountId = exports.assetsMainAccount = void 0;
const shared_1 = require("../../../domain/shared");
// assets:
exports.assetsMainAccount = "Assets";
exports.lndLedgerAccountId = `${exports.assetsMainAccount}:Reserve:Lightning`; // TODO: rename to Assets:Lnd
exports.coldStorageAccountId = `${exports.assetsMainAccount}:Reserve:Bitcoind`;
exports.lndLedgerAccountDescriptor = {
    id: exports.lndLedgerAccountId,
    currency: shared_1.WalletCurrency.Btc,
};
exports.coldStorageAccountDescriptor = {
    id: exports.coldStorageAccountId,
    currency: shared_1.WalletCurrency.Btc,
};
//# sourceMappingURL=accounts.js.map