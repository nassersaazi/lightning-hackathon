"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEEMIN = exports.FEECAP_BASIS_POINTS = exports.BtcNetwork = exports.isSha256Hash = exports.checkedToTargetConfs = exports.checkedToSats = exports.checkedToCurrencyBaseAmount = exports.toMilliSatsFromString = exports.toMilliSatsFromNumber = exports.toTargetConfs = exports.toSats = exports.sat2btc = exports.btc2sat = exports.SATS_PER_BTC = void 0;
const errors_1 = require("../errors");
const shared_1 = require("../shared");
exports.SATS_PER_BTC = 10 ** 8;
const btc2sat = (btc) => {
    return Math.round(btc * exports.SATS_PER_BTC);
};
exports.btc2sat = btc2sat;
const sat2btc = (sat) => {
    return sat / exports.SATS_PER_BTC;
};
exports.sat2btc = sat2btc;
const toSats = (amount) => {
    return Number(amount);
};
exports.toSats = toSats;
const toTargetConfs = (confs) => {
    return confs;
};
exports.toTargetConfs = toTargetConfs;
const toMilliSatsFromNumber = (amount) => {
    return amount;
};
exports.toMilliSatsFromNumber = toMilliSatsFromNumber;
const toMilliSatsFromString = (amount) => {
    return parseInt(amount, 10);
};
exports.toMilliSatsFromString = toMilliSatsFromString;
const checkedToCurrencyBaseAmount = (amount) => {
    if (!(amount && amount > 0))
        return new errors_1.InvalidCurrencyBaseAmountError();
    return amount;
};
exports.checkedToCurrencyBaseAmount = checkedToCurrencyBaseAmount;
const checkedToSats = (amount) => {
    if (!(amount && amount > 0)) {
        return new errors_1.InvalidSatoshiAmountError(`${amount}`);
    }
    if (amount > shared_1.MAX_SATS.amount) {
        return new shared_1.BtcAmountTooLargeError();
    }
    return (0, exports.toSats)(amount);
};
exports.checkedToSats = checkedToSats;
const checkedToTargetConfs = (confs) => {
    if (!(confs && confs > 0 && Number.isInteger(confs)))
        return new errors_1.InvalidTargetConfirmations();
    return (0, exports.toTargetConfs)(confs);
};
exports.checkedToTargetConfs = checkedToTargetConfs;
// Check for hexadecimal (case insensitive) 64-char SHA-256 hash
const isSha256Hash = (value) => !!value.match(/^[a-f0-9]{64}$/i);
exports.isSha256Hash = isSha256Hash;
exports.BtcNetwork = {
    mainnet: "mainnet",
    testnet: "testnet",
    signet: "signet",
    regtest: "regtest",
};
// Offchain routing fees are capped at 0.5%
exports.FEECAP_BASIS_POINTS = 50n; // 100 basis points == 1%
exports.FEEMIN = (0, exports.toSats)(10); // sats
//# sourceMappingURL=index.js.map