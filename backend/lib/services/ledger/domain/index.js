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
exports.toLedgerAccountDescriptor = exports.toLedgerAccountId = exports.liabilitiesMainAccount = void 0;
__exportStar(require("./legacy-entry-builder"), exports);
__exportStar(require("./entry-builder"), exports);
__exportStar(require("./accounts"), exports);
exports.liabilitiesMainAccount = "Liabilities";
const toLedgerAccountId = (walletId) => `${exports.liabilitiesMainAccount}:${walletId}`;
exports.toLedgerAccountId = toLedgerAccountId;
const toLedgerAccountDescriptor = (walletDescriptor) => {
    return {
        id: (0, exports.toLedgerAccountId)(walletDescriptor.id),
        currency: walletDescriptor.currency,
    };
};
exports.toLedgerAccountDescriptor = toLedgerAccountDescriptor;
//# sourceMappingURL=index.js.map