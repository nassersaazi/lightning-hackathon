"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const username_1 = __importDefault(require("../scalar/username"));
const map_info_1 = __importDefault(require("./map-info"));
const MapMarker = index_1.GT.Object({
    name: "MapMarker",
    fields: () => ({
        username: {
            type: username_1.default,
        },
        mapInfo: {
            type: index_1.GT.NonNull(map_info_1.default),
        },
    }),
});
exports.default = MapMarker;
//# sourceMappingURL=map-marker.js.map