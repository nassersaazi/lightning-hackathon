"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const wallets_1 = require("../../../domain/wallets");
const TxStatus = index_1.GT.Enum({
    name: "TxStatus",
    values: {
        PENDING: { value: wallets_1.TxStatus.Pending },
        SUCCESS: { value: wallets_1.TxStatus.Success },
        FAILURE: { value: wallets_1.TxStatus.Failure },
    },
});
exports.default = TxStatus;
//# sourceMappingURL=tx-status.js.map