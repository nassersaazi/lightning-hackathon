"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const redis_1 = require("../../services/redis");
const health_1 = require("../../services/lnd/health");
function default_1({ checkDbConnectionStatus, checkRedisStatus, checkLndsStatus, }) {
    const lndStatus = {};
    if (checkLndsStatus) {
        health_1.lndStatusEvent.on("started", ({ pubkey, active }) => {
            lndStatus[pubkey] = active;
        });
        health_1.lndStatusEvent.on("stopped", ({ pubkey, active }) => {
            lndStatus[pubkey] = active;
        });
    }
    return async (_req, res) => {
        const isMongoAlive = !checkDbConnectionStatus || mongoose_1.default.connection.readyState === 1;
        const isRedisAlive = !checkRedisStatus || (await isRedisAvailable());
        const statuses = Object.values(lndStatus);
        const areLndsAlive = !checkLndsStatus || (statuses.length > 0 && statuses.some((s) => s));
        res.status(isMongoAlive && isRedisAlive && areLndsAlive ? 200 : 503).send();
    };
}
exports.default = default_1;
const isRedisAvailable = async () => {
    try {
        return (await redis_1.redis.ping()) === "PONG";
    }
    catch {
        return false;
    }
};
//# sourceMappingURL=healthz.js.map