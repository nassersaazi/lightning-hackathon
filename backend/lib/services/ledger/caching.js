"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonEndUserWalletIds = exports.getDealerWalletIds = exports.getFunderWalletId = exports.getBankOwnerWalletId = exports.getDealerUsdWalletId = exports.getDealerBtcWalletId = exports.setFunderWalletResolver = exports.setDealerUsdWalletResolver = exports.setDealerBtcWalletResolver = exports.setBankOwnerWalletResolver = void 0;
let cacheDealerBtcWalletId;
let cacheDealerUsdWalletId;
let cacheBankOwnerWalletId;
let cacheFunderWalletId;
const throwError = (wallet) => Promise.reject(`Invalid ${wallet}WalletPath`);
let bankOwnerResolver = () => throwError("bankOwner");
let dealerBtcResolver = () => throwError("dealerBtc");
let dealerUsdResolver = () => throwError("dealerUsd");
let funderResolver = () => throwError("funder");
function setBankOwnerWalletResolver(resolver) {
    bankOwnerResolver = resolver;
}
exports.setBankOwnerWalletResolver = setBankOwnerWalletResolver;
function setDealerBtcWalletResolver(resolver) {
    dealerBtcResolver = resolver;
}
exports.setDealerBtcWalletResolver = setDealerBtcWalletResolver;
function setDealerUsdWalletResolver(resolver) {
    dealerUsdResolver = resolver;
}
exports.setDealerUsdWalletResolver = setDealerUsdWalletResolver;
function setFunderWalletResolver(resolver) {
    funderResolver = resolver;
}
exports.setFunderWalletResolver = setFunderWalletResolver;
const getDealerBtcWalletId = async () => {
    if (cacheDealerBtcWalletId) {
        return cacheDealerBtcWalletId;
    }
    const dealerBtcId = await dealerBtcResolver();
    cacheDealerBtcWalletId = dealerBtcId;
    return cacheDealerBtcWalletId;
};
exports.getDealerBtcWalletId = getDealerBtcWalletId;
const getDealerUsdWalletId = async () => {
    if (cacheDealerUsdWalletId) {
        return cacheDealerUsdWalletId;
    }
    const dealerUsdId = await dealerUsdResolver();
    cacheDealerUsdWalletId = dealerUsdId;
    return cacheDealerUsdWalletId;
};
exports.getDealerUsdWalletId = getDealerUsdWalletId;
const getBankOwnerWalletId = async () => {
    if (cacheBankOwnerWalletId) {
        return cacheBankOwnerWalletId;
    }
    const bankOwnerId = await bankOwnerResolver();
    cacheBankOwnerWalletId = bankOwnerId;
    return cacheBankOwnerWalletId;
};
exports.getBankOwnerWalletId = getBankOwnerWalletId;
const getFunderWalletId = async () => {
    if (cacheFunderWalletId) {
        return cacheFunderWalletId;
    }
    const funderId = await funderResolver();
    cacheFunderWalletId = funderId;
    return cacheFunderWalletId;
};
exports.getFunderWalletId = getFunderWalletId;
const getDealerWalletIds = async () => ({
    dealerBtc: await (0, exports.getDealerBtcWalletId)(),
    dealerUsd: await (0, exports.getDealerUsdWalletId)(),
});
exports.getDealerWalletIds = getDealerWalletIds;
const getNonEndUserWalletIds = async () => ({
    ...(await (0, exports.getDealerWalletIds)()),
    bankOwner: await (0, exports.getBankOwnerWalletId)(),
    funder: await (0, exports.getFunderWalletId)(),
});
exports.getNonEndUserWalletIds = getNonEndUserWalletIds;
//# sourceMappingURL=caching.js.map