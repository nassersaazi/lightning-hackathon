"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const Network = index_1.GT.Enum({
    name: "Network",
    values: {
        mainnet: {},
        testnet: {},
        signet: {},
        regtest: {},
    },
});
exports.default = Network;
//# sourceMappingURL=network.js.map