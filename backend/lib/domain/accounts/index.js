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
exports.checkedToAccountId = exports.sanityCheckedDefaultAccountWithdrawFee = exports.checkedToContactAlias = exports.ContactAliasRegex = exports.checkedToUsername = exports.UsernameRegex = exports.checkedAccountStatus = exports.checkedMapTitle = exports.checkedCoordinates = exports.checkedToKratosUserId = void 0;
const bitcoin_1 = require("../bitcoin");
const errors_1 = require("../errors");
const errors_2 = require("./errors");
const primitives_1 = require("./primitives");
__exportStar(require("./errors"), exports);
__exportStar(require("./limits-checker"), exports);
__exportStar(require("./new-limits-checker"), exports);
__exportStar(require("./account-validator"), exports);
__exportStar(require("./primitives"), exports);
const KratosUserIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const checkedToKratosUserId = (userId) => {
    if (!userId.match(KratosUserIdRegex)) {
        return new errors_1.InvalidKratosUserId(userId);
    }
    return userId;
};
exports.checkedToKratosUserId = checkedToKratosUserId;
const checkedCoordinates = ({ latitude, longitude, }) => {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return new errors_1.InvalidCoordinatesError();
    }
    const coordinates = { latitude, longitude };
    return coordinates;
};
exports.checkedCoordinates = checkedCoordinates;
const checkedMapTitle = (title) => {
    if (title.length < 3 || title.length > 100) {
        return new errors_1.InvalidBusinessTitleLengthError();
    }
    return title;
};
exports.checkedMapTitle = checkedMapTitle;
const checkedAccountStatus = (status) => {
    if (!Object.values(primitives_1.AccountStatus).includes(status)) {
        return new errors_1.InvalidAccountStatusError(status);
    }
    return status;
};
exports.checkedAccountStatus = checkedAccountStatus;
exports.UsernameRegex = /(?!^(1|3|bc1|lnbc1))^[0-9a-z_]{3,50}$/i;
const checkedToUsername = (username) => {
    if (!username.match(exports.UsernameRegex)) {
        return new errors_1.InvalidUsername(username);
    }
    return username;
};
exports.checkedToUsername = checkedToUsername;
exports.ContactAliasRegex = /^[0-9A-Za-z_]{3,50}$/i;
const checkedToContactAlias = (alias) => {
    if (!alias.match(exports.ContactAliasRegex)) {
        return new errors_1.InvalidContactAlias(alias);
    }
    return alias;
};
exports.checkedToContactAlias = checkedToContactAlias;
const minWithdrawalFeeAccount = (0, bitcoin_1.toSats)(0);
const maxWithdrawalFeeAccount = (0, bitcoin_1.toSats)(100000);
const sanityCheckedDefaultAccountWithdrawFee = (fee) => {
    if (fee < minWithdrawalFeeAccount || fee > maxWithdrawalFeeAccount) {
        return new errors_1.InvalidWithdrawFeeError(fee.toString());
    }
    return (0, bitcoin_1.toSats)(fee);
};
exports.sanityCheckedDefaultAccountWithdrawFee = sanityCheckedDefaultAccountWithdrawFee;
const checkedToAccountId = (accountId) => {
    if (accountId.length !== 24) {
        // TODO: move to a uuid-v4
        return new errors_2.InvalidAccountIdError(accountId);
    }
    return accountId;
};
exports.checkedToAccountId = checkedToAccountId;
//# sourceMappingURL=index.js.map