"use strict";
// an accounting reminder:
// https://en.wikipedia.org/wiki/Double-entry_bookkeeping
Object.defineProperty(exports, "__esModule", { value: true });
exports.escrowAccountingPath = exports.lndAccountingPath = exports.bitcoindAccountingPath = exports.assetsMainAccount = void 0;
// assets:
exports.assetsMainAccount = "Assets";
exports.bitcoindAccountingPath = `${exports.assetsMainAccount}:Reserve:Bitcoind`;
exports.lndAccountingPath = `${exports.assetsMainAccount}:Reserve:Lightning`; // TODO: rename to Assets:Lnd
exports.escrowAccountingPath = `${exports.assetsMainAccount}:Reserve:Escrow`; // TODO: rename to Assets:Lnd:Escrow
//# sourceMappingURL=accounts.js.map