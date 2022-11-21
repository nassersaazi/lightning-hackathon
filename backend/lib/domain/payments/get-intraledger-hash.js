"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIntraLedgerHash = void 0;
const crypto_1 = require("crypto");
const sha256 = (buffer) => (0, crypto_1.createHash)("sha256").update(buffer).digest("hex");
const generateIntraLedgerHash = () => sha256((0, crypto_1.randomBytes)(32));
exports.generateIntraLedgerHash = generateIntraLedgerHash;
//# sourceMappingURL=get-intraledger-hash.js.map