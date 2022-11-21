"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _config_1 = require("../../../config/index");
const onchain_1 = require("../../../domain/bitcoin/onchain");
const error_1 = require("../../error");
const index_1 = require("../../index");
const OnChainAddress = index_1.GT.Scalar({
    name: "OnChainAddress",
    description: "An address for an on-chain bitcoin destination",
    parseValue(value) {
        if (typeof value !== "string") {
            return new error_1.InputValidationError({ message: "Invalid type for OnChainAddress" });
        }
        return validOnChainAddressValue(value);
    },
    parseLiteral(ast) {
        if (ast.kind === index_1.GT.Kind.STRING) {
            return validOnChainAddressValue(ast.value);
        }
        return new error_1.InputValidationError({ message: "Invalid type for OnChainAddress" });
    },
});
function validOnChainAddressValue(value) {
    const address = (0, onchain_1.checkedToOnChainAddress)({ network: _config_1.BTC_NETWORK, value });
    if (address instanceof Error)
        return new error_1.InputValidationError({ message: "Invalid value for OnChainAddress" });
    return address;
}
exports.default = OnChainAddress;
//# sourceMappingURL=on-chain-address.js.map