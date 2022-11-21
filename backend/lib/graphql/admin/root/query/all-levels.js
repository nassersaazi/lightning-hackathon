"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../index");
const _config_1 = require("../../../../config/index");
const account_level_1 = __importDefault(require("../../types/scalar/account-level"));
const AllLevelsQuery = index_1.GT.Field({
    type: index_1.GT.NonNullList(account_level_1.default),
    resolve: () => {
        return _config_1.levels;
    },
});
exports.default = AllLevelsQuery;
//# sourceMappingURL=all-levels.js.map