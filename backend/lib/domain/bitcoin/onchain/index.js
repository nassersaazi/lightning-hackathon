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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqueAddressesForTxn = exports.OutgoingOnChainTransaction = exports.IncomingOnChainTransaction = exports.checkedToScanDepth = exports.checkedToOnChainAddress = void 0;
const errors_1 = require("../../errors");
__exportStar(require("./errors"), exports);
__exportStar(require("./tx-filter"), exports);
__exportStar(require("./tx-decoder"), exports);
const checkedToOnChainAddress = ({ network, value, }) => {
    // Regex patterns: https://regexland.com/regex-bitcoin-addresses/
    const regexes = {
        mainnet: [/^[13]{1}[a-km-zA-HJ-NP-Z1-9]{26,34}$/, /^bc1[a-z0-9]{39,59}$/i],
        testnet: [/^[mn2]{1}[a-km-zA-HJ-NP-Z1-9]{26,34}$/, /^tb1[a-z0-9]{39,59}$/i],
        signet: [/^[mn2]{1}[a-km-zA-HJ-NP-Z1-9]{26,34}$/, /^tb1[a-z0-9]{39,59}$/i],
        regtest: [/^bcrt1[a-z0-9]{39,59}$/i],
    };
    if (regexes[network].some((r) => value.match(r)))
        return value;
    return new errors_1.InvalidOnChainAddress();
};
exports.checkedToOnChainAddress = checkedToOnChainAddress;
const checkedToScanDepth = (value) => {
    // 1 month as max scan depth
    if (value && value > 0 && value <= 4380)
        return value;
    return new errors_1.InvalidScanDepthAmount();
};
exports.checkedToScanDepth = checkedToScanDepth;
const IncomingOnChainTransaction = ({ confirmations, rawTx, fee, createdAt, }) => ({
    confirmations,
    rawTx,
    fee,
    createdAt,
    uniqueAddresses: () => (0, exports.uniqueAddressesForTxn)(rawTx),
});
exports.IncomingOnChainTransaction = IncomingOnChainTransaction;
const OutgoingOnChainTransaction = ({ confirmations, rawTx, fee, createdAt, }) => ({
    confirmations,
    rawTx,
    fee,
    createdAt,
    uniqueAddresses: () => (0, exports.uniqueAddressesForTxn)(rawTx),
});
exports.OutgoingOnChainTransaction = OutgoingOnChainTransaction;
const uniqueAddressesForTxn = (rawTx) => rawTx.outs.reduce((a, o) => {
    if (o.address && !a.includes(o.address))
        a.push(o.address);
    return a;
}, []);
exports.uniqueAddressesForTxn = uniqueAddressesForTxn;
//# sourceMappingURL=index.js.map