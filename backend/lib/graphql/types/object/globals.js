"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dedent_1 = __importDefault(require("dedent"));
const index_1 = require("../../index");
const network_1 = __importDefault(require("../scalar/network"));
const build_information_1 = __importDefault(require("./build-information"));
const Globals = index_1.GT.Object({
    name: "Globals",
    description: "Provides global settings for the application which might have an impact for the user.",
    fields: () => ({
        nodesIds: {
            type: index_1.GT.NonNullList(index_1.GT.String),
            description: (0, dedent_1.default) `A list of public keys for the running lightning nodes.
        This can be used to know if an invoice belongs to one of our nodes.`,
        },
        network: {
            type: index_1.GT.NonNull(network_1.default),
            description: (0, dedent_1.default) `Which network (mainnet, testnet, regtest, signet) this instance is running on.`,
        },
        buildInformation: { type: index_1.GT.NonNull(build_information_1.default) },
        lightningAddressDomain: {
            type: index_1.GT.NonNull(index_1.GT.String),
            description: (0, dedent_1.default) `The domain name for lightning addresses accepted by this Galoy instance`,
        },
        lightningAddressDomainAliases: {
            type: index_1.GT.NonNullList(index_1.GT.String),
        },
    }),
});
exports.default = Globals;
//# sourceMappingURL=globals.js.map