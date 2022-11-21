"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialResult = void 0;
exports.PartialResult = {
    ok: (result) => ({
        result,
        partialResult: true,
    }),
    partial: (result, error) => ({
        result,
        error,
        partialResult: true,
    }),
    err: (error) => ({
        result: null,
        error,
        partialResult: true,
    }),
};
//# sourceMappingURL=partial-result.js.map