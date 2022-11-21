"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TxDecoder = void 0;
const bitcoin_1 = require("..");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const TxDecoder = (networkName) => {
    const mapping = {
        mainnet: "bitcoin",
        testnet: "testnet",
        signet: "testnet",
        regtest: "regtest",
    };
    const network = bitcoinjs_lib_1.networks[mapping[networkName]];
    const decode = (txHex) => {
        const tx = bitcoinjs_lib_1.Transaction.fromHex(txHex);
        return {
            txHash: tx.getId(),
            outs: decodeOutput(tx, network),
        };
    };
    return {
        decode,
    };
};
exports.TxDecoder = TxDecoder;
const decodeOutput = (tx, network) => {
    const format = (out, network) => {
        let decodedAddress = null;
        try {
            decodedAddress = bitcoinjs_lib_1.address.fromOutputScript(out.script, network);
        }
        catch (_) {
            // OP_RETURN outputs don't have a valid address associated with them
        }
        return {
            sats: (0, bitcoin_1.toSats)(out.value),
            address: decodedAddress,
        };
    };
    return tx.outs.map((out) => format(out, network));
};
//# sourceMappingURL=tx-decoder.js.map