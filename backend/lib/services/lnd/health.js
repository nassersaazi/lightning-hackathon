"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lndStatusEvent = exports.stopLndHealthCheck = exports.activateLndHealthCheck = exports.isUp = void 0;
const events_1 = require("events");
const lightning_1 = require("lightning");
const logger_1 = require("../logger");
const _config_1 = require("../../config/index");
const unauth_1 = require("./unauth");
const auth_1 = require("./auth");
/*
    Check the status of the wallet and emit current state
*/
const intervals = [];
const isUpLoop = async (param) => {
    await (0, exports.isUp)(param);
    const interval = setInterval(async () => {
        await (0, exports.isUp)(param);
    }, _config_1.LND_HEALTH_REFRESH_TIME_MS);
    intervals.push(interval);
};
const isLndUp = async (param) => {
    let active = false;
    const { lnd, socket, active: pastStateActive } = param;
    try {
        // will throw if there is an error
        const { is_active, is_ready } = await (0, lightning_1.getWalletStatus)({ lnd });
        active = !!is_active && !!is_ready;
    }
    catch (err) {
        logger_1.baseLogger.warn({ err }, `can't get wallet info from ${socket}`);
        active = false;
    }
    const authParam = auth_1.params.find((p) => p.socket === socket);
    if (!authParam) {
        throw new Error("unreachable: this should not happen, authParam should not be null");
    }
    authParam.active = active;
    param.active = active;
    if (active && !pastStateActive) {
        exports.lndStatusEvent.emit("started", authParam);
    }
    if (!active && pastStateActive) {
        exports.lndStatusEvent.emit("stopped", authParam);
    }
    logger_1.baseLogger.debug({ socket, active }, "lnd pulse");
};
exports.isUp = isLndUp;
// launching a loop to update whether lnd are active or not
const activateLndHealthCheck = () => unauth_1.params.forEach(isUpLoop);
exports.activateLndHealthCheck = activateLndHealthCheck;
const stopLndHealthCheck = () => intervals.forEach(clearInterval);
exports.stopLndHealthCheck = stopLndHealthCheck;
class LndStatusEventEmitter extends events_1.EventEmitter {
}
exports.lndStatusEvent = new LndStatusEventEmitter();
//# sourceMappingURL=health.js.map