"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.txDirectionValues = void 0;
const index_1 = require("../../index");
exports.txDirectionValues = {
    SEND: "send",
    RECEIVE: "receive",
};
const TxDirection = index_1.GT.Enum({
    name: "TxDirection",
    values: {
        SEND: { value: exports.txDirectionValues.SEND },
        RECEIVE: { value: exports.txDirectionValues.RECEIVE },
    },
});
exports.default = TxDirection;
//# sourceMappingURL=tx-direction.js.map