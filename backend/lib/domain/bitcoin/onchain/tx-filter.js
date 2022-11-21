"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TxFilter = void 0;
const TxFilter = ({ confirmationsLessThan, confirmationsGreaterThanOrEqual, addresses, }) => {
    const apply = (txs) => {
        return txs.filter(({ confirmations, rawTx: { outs } }) => {
            if (!!confirmationsGreaterThanOrEqual &&
                confirmations < confirmationsGreaterThanOrEqual) {
                return false;
            }
            if (!!confirmationsLessThan && confirmations >= confirmationsLessThan) {
                return false;
            }
            if (!!addresses &&
                !outs.some((out) => out.address !== null && addresses.includes(out.address))) {
                return false;
            }
            return true;
        });
    };
    return { apply };
};
exports.TxFilter = TxFilter;
//# sourceMappingURL=tx-filter.js.map