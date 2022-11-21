"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _config_1 = require("../../../config/index");
const _app_1 = require("../../../app/index");
const index_1 = require("../../index");
const globals_1 = __importDefault(require("../../types/object/globals"));
const GlobalsQuery = index_1.GT.Field({
    type: globals_1.default,
    resolve: async () => {
        let nodesIds = await _app_1.Lightning.listNodesPubkeys();
        if (nodesIds instanceof Error)
            nodesIds = [];
        return {
            nodesIds,
            network: _config_1.BTC_NETWORK,
            lightningAddressDomain: (0, _config_1.getLightningAddressDomain)(),
            lightningAddressDomainAliases: (0, _config_1.getLightningAddressDomainAliases)(),
            buildInformation: (0, _config_1.getGaloyBuildInformation)(),
        };
    },
});
exports.default = GlobalsQuery;
//# sourceMappingURL=globals.js.map