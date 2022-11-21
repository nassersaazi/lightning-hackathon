"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidWalletInvoiceBuilderStateError = void 0;
const shared_1 = require("../shared");
class InvalidWalletInvoiceBuilderStateError extends shared_1.ValidationError {
    constructor() {
        super(...arguments);
        this.level = shared_1.ErrorLevel.Critical;
    }
}
exports.InvalidWalletInvoiceBuilderStateError = InvalidWalletInvoiceBuilderStateError;
//# sourceMappingURL=errors.js.map