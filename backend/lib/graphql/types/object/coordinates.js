"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const Coordinates = index_1.GT.Object({
    name: "Coordinates",
    fields: () => ({
        longitude: {
            type: index_1.GT.NonNull(index_1.GT.Float),
        },
        latitude: {
            type: index_1.GT.NonNull(index_1.GT.Float),
        },
    }),
});
exports.default = Coordinates;
//# sourceMappingURL=coordinates.js.map