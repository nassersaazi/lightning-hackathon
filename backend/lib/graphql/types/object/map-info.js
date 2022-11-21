"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const coordinates_1 = __importDefault(require("./coordinates"));
const MapInfo = index_1.GT.Object({
    name: "MapInfo",
    fields: () => ({
        title: {
            type: index_1.GT.NonNull(index_1.GT.String),
        },
        coordinates: {
            type: index_1.GT.NonNull(coordinates_1.default),
        },
    }),
});
exports.default = MapInfo;
//# sourceMappingURL=map-info.js.map