"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const user_request_auth_code_1 = __importDefault(require("../root/mutation/user-request-auth-code"));
const user_login_1 = __importDefault(require("../root/mutation/user-login"));
const captcha_request_auth_code_1 = __importDefault(require("../root/mutation/captcha-request-auth-code"));
const captcha_create_challenge_1 = __importDefault(require("../root/mutation/captcha-create-challenge"));
const account_update_level_1 = __importDefault(require("./root/mutation/account-update-level"));
const account_update_status_1 = __importDefault(require("./root/mutation/account-update-status"));
const business_update_map_info_1 = __importDefault(require("./root/mutation/business-update-map-info"));
const cold_storage_rebalance_to_hot_wallet_1 = __importDefault(require("./root/mutation/cold-storage-rebalance-to-hot-wallet"));
const account_add_usd_wallet_1 = __importDefault(require("./root/mutation/account-add-usd-wallet"));
const MutationType = index_1.GT.Object({
    name: "Mutation",
    fields: () => ({
        userRequestAuthCode: user_request_auth_code_1.default,
        userLogin: user_login_1.default,
        captchaCreateChallenge: captcha_create_challenge_1.default,
        captchaRequestAuthCode: captcha_request_auth_code_1.default,
        accountUpdateLevel: account_update_level_1.default,
        accountUpdateStatus: account_update_status_1.default,
        accountsAddUsdWallet: account_add_usd_wallet_1.default,
        businessUpdateMapInfo: business_update_map_info_1.default,
        coldStorageRebalanceToHotWallet: cold_storage_rebalance_to_hot_wallet_1.default,
    }),
});
exports.default = MutationType;
//# sourceMappingURL=mutations.js.map