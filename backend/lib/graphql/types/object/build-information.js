"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const timestamp_1 = __importDefault(require("../scalar/timestamp"));
const BuildInformation = index_1.GT.Object({
    name: "BuildInformation",
    fields: () => ({
        commitHash: { type: index_1.GT.String },
        buildTime: { type: timestamp_1.default },
        helmRevision: { type: index_1.GT.Int },
    }),
});
exports.default = BuildInformation;
//# sourceMappingURL=build-information.js.map