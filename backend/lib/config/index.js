"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingEarn = exports.levels = exports.MIN_SATS_FOR_PRICE_RATIO_PRECISION = exports.BTC_PRICE_PRECISION_OFFSET = exports.SAT_PRICE_PRECISION_OFFSET = exports.MAX_BYTES_FOR_MEMO = exports.MAX_AGE_TIME_CODE = exports.ONE_DAY = exports.SECS_PER_10_MINS = exports.SECS_PER_5_MINS = exports.SECS_PER_MIN = exports.TWO_MONTHS_IN_MS = exports.MS_PER_DAY = exports.MS_PER_HOUR = void 0;
const primitives_1 = require("../domain/primitives");
__exportStar(require("./error"), exports);
__exportStar(require("./process"), exports);
__exportStar(require("./yaml"), exports);
__exportStar(require("./schema"), exports);
__exportStar(require("./utils"), exports);
exports.MS_PER_HOUR = (60 * 60 * 1000);
exports.MS_PER_DAY = (24 * exports.MS_PER_HOUR);
exports.TWO_MONTHS_IN_MS = (60 * exports.MS_PER_DAY);
exports.SECS_PER_MIN = 60;
exports.SECS_PER_5_MINS = (60 * 5);
exports.SECS_PER_10_MINS = (exports.SECS_PER_5_MINS * 2);
exports.ONE_DAY = (0, primitives_1.toDays)(1);
exports.MAX_AGE_TIME_CODE = (20 * 60);
exports.MAX_BYTES_FOR_MEMO = 639; // BOLT
exports.SAT_PRICE_PRECISION_OFFSET = 12;
exports.BTC_PRICE_PRECISION_OFFSET = 4;
exports.MIN_SATS_FOR_PRICE_RATIO_PRECISION = 5000n;
exports.levels = [1, 2];
// onboarding
exports.onboardingEarn = {
    walletDownloaded: 1,
    walletActivated: 1,
    whatIsBitcoin: 1,
    sat: 2,
    whereBitcoinExist: 5,
    whoControlsBitcoin: 5,
    copyBitcoin: 5,
    moneyImportantGovernement: 10,
    moneyIsImportant: 10,
    whyStonesShellGold: 10,
    moneyEvolution: 10,
    coincidenceOfWants: 10,
    moneySocialAggrement: 10,
    WhatIsFiat: 10,
    whyCareAboutFiatMoney: 10,
    GovernementCanPrintMoney: 10,
    FiatLosesValueOverTime: 10,
    OtherIssues: 10,
    LimitedSupply: 20,
    Decentralized: 20,
    NoCounterfeitMoney: 20,
    HighlyDivisible: 20,
    securePartOne: 20,
    securePartTwo: 20,
};
//# sourceMappingURL=index.js.map