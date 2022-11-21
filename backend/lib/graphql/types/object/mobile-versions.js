"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const MobileVersions = index_1.GT.Object({
    name: "MobileVersions",
    fields: () => ({
        platform: { type: index_1.GT.NonNull(index_1.GT.String) },
        currentSupported: { type: index_1.GT.NonNull(index_1.GT.Int) },
        minSupported: { type: index_1.GT.NonNull(index_1.GT.Int) },
    }),
});
exports.default = MobileVersions;
//# sourceMappingURL=mobile-versions.js.map