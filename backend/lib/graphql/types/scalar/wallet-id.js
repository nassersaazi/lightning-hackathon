"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wallets_1 = require("../../../domain/wallets");
const error_1 = require("../../error");
const index_1 = require("../../index");
const WalletId = index_1.GT.Scalar({
    name: "WalletId",
    description: "Unique identifier of a wallet",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for WalletId" });
        }
        return validWalletIdValue(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validWalletIdValue(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for WalletId" });
    },
});
function validWalletIdValue(value) {
    const checkedWalletId = (0, wallets_1.checkedToWalletId)(value);
    if (checkedWalletId instanceof Error) {
        return new error_1.InputValidationError({ message: "Invalid value for WalletId" });
    }
    return checkedWalletId;
}
exports.default = WalletId;
//# sourceMappingURL=wallet-id.js.map