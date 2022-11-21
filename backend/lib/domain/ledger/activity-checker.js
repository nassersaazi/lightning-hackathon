"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityChecker = void 0;
const bitcoin_1 = require("../bitcoin");
const fiat_1 = require("../fiat");
const shared_1 = require("../shared");
const MS_PER_HOUR = (60 * 60 * 1000);
const MS_PER_DAY = (24 * MS_PER_HOUR);
const MS_PER_30_DAYS = (30 * MS_PER_DAY);
const ActivityChecker = ({ dCConverter, getVolumeFn, monthlyVolumeThreshold, }) => {
    const aboveThreshold = async (wallets) => {
        const timestamp30DaysAgo = new Date(Date.now() - MS_PER_30_DAYS);
        const volumeCum = {
            outgoingCents: (0, fiat_1.toCents)(0),
            incomingCents: (0, fiat_1.toCents)(0),
        };
        let incomingCents;
        let outgoingCents;
        for (const wallet of wallets) {
            const volume = await getVolumeFn({
                timestamp: timestamp30DaysAgo,
                walletId: wallet.id,
            });
            if (volume instanceof Error)
                return volume;
            if (wallet.currency === shared_1.WalletCurrency.Btc) {
                incomingCents = dCConverter.fromSatsToCents((0, bitcoin_1.toSats)(volume.incomingBaseAmount));
                outgoingCents = dCConverter.fromSatsToCents((0, bitcoin_1.toSats)(volume.outgoingBaseAmount));
            }
            else {
                incomingCents = (0, fiat_1.toCents)(volume.incomingBaseAmount);
                outgoingCents = (0, fiat_1.toCents)(volume.outgoingBaseAmount);
            }
            volumeCum.incomingCents = (0, fiat_1.toCents)(volumeCum.incomingCents + incomingCents);
            volumeCum.outgoingCents = (0, fiat_1.toCents)(volumeCum.outgoingCents + outgoingCents);
        }
        return (volumeCum.outgoingCents > monthlyVolumeThreshold ||
            volumeCum.incomingCents > monthlyVolumeThreshold);
    };
    return {
        aboveThreshold,
    };
};
exports.ActivityChecker = ActivityChecker;
//# sourceMappingURL=activity-checker.js.map