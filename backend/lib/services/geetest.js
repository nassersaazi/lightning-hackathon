"use strict";
// Based on https://github.com/GeeTeam/gt3-server-node-express-bypass/blob/master/app.js
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// https://docs.geetest.com/captcha/apirefer/api/server
// doing this: "If the storage space is not sufficient: Send request to check bypass status before starting the verification process."
const errors_1 = require("../domain/captcha/errors");
const axios_1 = __importDefault(require("axios"));
const geetest_lib_1 = __importDefault(require("gt3-server-node-express-sdk/sdk/geetest_lib")); // galoy fork
async function sendRequest(params) {
    const requestUrl = "https://bypass.geetest.com/v1/bypass_status.php";
    let bypassRes;
    try {
        const res = await (0, axios_1.default)({
            url: requestUrl,
            method: "GET",
            timeout: 5000,
            params,
        });
        const resBody = res.status === 200 ? res.data : "";
        bypassRes = resBody["status"];
    }
    catch (e) {
        bypassRes = "";
    }
    return bypassRes;
}
const Geetest = (config) => {
    const getBypassStatus = async () => {
        return sendRequest({ gt: config.id });
    };
    const register = async () => {
        try {
            const gtLib = new geetest_lib_1.default(config.id, config.key);
            const digestmod = "md5";
            const params = {
                digestmod,
                client_type: "native",
            };
            const bypasscache = await getBypassStatus(); // not a cache
            let result;
            if (bypasscache === "success") {
                result = await gtLib.register(digestmod, params);
            }
            else {
                result = await gtLib.localRegister();
            }
            const { success, gt, challenge, new_captcha: newCaptcha } = JSON.parse(result.data);
            const geetestRegister = { success, gt, challenge, newCaptcha };
            return geetestRegister;
        }
        catch (err) {
            return new errors_1.UnknownCaptchaError(err);
        }
    };
    const validate = async (challenge, validate, seccode) => {
        try {
            const gtLib = new geetest_lib_1.default(config.id, config.key);
            const bypasscache = await getBypassStatus(); // not a cache
            let result;
            if (bypasscache === "success") {
                result = await gtLib.successValidate(challenge, validate, seccode, []);
            }
            else {
                result = gtLib.failValidate(challenge, validate, seccode);
            }
            if (result.status !== 1) {
                return new errors_1.CaptchaUserFailToPassError();
            }
            return true;
        }
        catch (err) {
            return new errors_1.UnknownCaptchaError(err);
        }
    };
    return { register, validate };
};
exports.default = Geetest;
//# sourceMappingURL=geetest.js.map