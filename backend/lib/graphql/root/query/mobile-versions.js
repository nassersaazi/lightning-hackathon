"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const mobile_versions_1 = __importDefault(require("../../types/object/mobile-versions"));
const _config_1 = require("../../../config/index");
const MobileVersionsQuery = index_1.GT.Field({
    type: index_1.GT.List(mobile_versions_1.default),
    resolve: async () => {
        const { minBuildNumberAndroid, lastBuildNumberAndroid, minBuildNumberIos, lastBuildNumberIos, } = (0, _config_1.getBuildVersions)();
        return [
            {
                platform: "android",
                currentSupported: lastBuildNumberAndroid,
                minSupported: minBuildNumberAndroid,
            },
            {
                platform: "ios",
                currentSupported: lastBuildNumberIos,
                minSupported: minBuildNumberIos,
            },
        ];
    },
});
exports.default = MobileVersionsQuery;
//# sourceMappingURL=mobile-versions.js.map