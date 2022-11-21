"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const map_marker_1 = __importDefault(require("../../types/object/map-marker"));
const _app_1 = require("../../../app/index");
const BusinessMapMarkersQuery = index_1.GT.Field({
    type: index_1.GT.List(map_marker_1.default),
    resolve: async () => {
        const businesses = await _app_1.Accounts.getBusinessMapMarkers();
        if (businesses instanceof Error) {
            throw businesses;
        }
        return businesses;
    },
});
exports.default = BusinessMapMarkersQuery;
//# sourceMappingURL=business-map-markers.js.map