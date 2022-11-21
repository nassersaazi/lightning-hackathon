"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNodesPubkeys = void 0;
const lnd_1 = require("../../services/lnd");
const listNodesPubkeys = async () => {
    const offChainService = (0, lnd_1.LndService)();
    if (offChainService instanceof Error)
        return offChainService;
    return offChainService.listAllPubkeys();
};
exports.listNodesPubkeys = listNodesPubkeys;
//# sourceMappingURL=list-nodes-pubkeys.js.map