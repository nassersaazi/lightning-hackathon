"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBackup = void 0;
const _config_1 = require("../../config/index");
const storage_1 = require("@google-cloud/storage");
const axios_1 = __importDefault(require("axios"));
const tracing_1 = require("../../services/tracing");
const shared_1 = require("../../domain/shared");
const uploadBackup = (logger) => async ({ backup, pubkey }) => {
    logger.debug({ backup }, "updating scb on dbx");
    const filename = `${_config_1.BTC_NETWORK}_lnd_scb_${pubkey}_${Date.now()}`;
    if (!(_config_1.DropboxAccessToken ||
        _config_1.GcsApplicationCredentials ||
        (_config_1.Nextcloudurl && _config_1.Nextclouduser && _config_1.Nextcloudpassword))) {
        const err = new Error("Missing environment variable for LND static channel backup destination.");
        logger.error(err);
        (0, tracing_1.recordExceptionInCurrentSpan)({ error: err, level: shared_1.ErrorLevel.Critical });
    }
    if (!_config_1.DropboxAccessToken) {
        (0, tracing_1.addAttributesToCurrentSpan)({ ["uploadBackup.destination.dropbox"]: "false" });
    }
    else {
        (0, tracing_1.addAttributesToCurrentSpan)({ ["uploadBackup.destination.dropbox"]: "true" });
        (0, tracing_1.asyncRunInSpan)("app.admin.backup.uploadBackup.dropbox", {
            attributes: {
                [tracing_1.SemanticAttributes.CODE_FUNCTION]: "uploadBackup.dropbox",
                [tracing_1.SemanticAttributes.CODE_NAMESPACE]: "app.admin.backup",
            },
        }, async () => {
            try {
                await axios_1.default.post(`https://content.dropboxapi.com/2/files/upload`, backup, {
                    headers: {
                        "Authorization": `Bearer ${_config_1.DropboxAccessToken}`,
                        "Content-Type": `Application/octet-stream`,
                        "Dropbox-API-Arg": `{"autorename":false,"mode":"add","mute":true,"path":"/${filename}","strict_conflict":false}`,
                    },
                });
                logger.info({ backup }, "Static channel backup to Dropbox successful.");
                (0, tracing_1.addEventToCurrentSpan)("Static channel backup to Dropbox successful.");
            }
            catch (error) {
                logger.error({ error }, "Static channel backup to Dropbox failed.");
                (0, tracing_1.recordExceptionInCurrentSpan)({ error: error, level: shared_1.ErrorLevel.Warn });
            }
        });
    }
    if (!_config_1.GcsApplicationCredentials) {
        (0, tracing_1.addAttributesToCurrentSpan)({ ["uploadBackup.destination.googlecloud"]: "false" });
    }
    else {
        (0, tracing_1.addAttributesToCurrentSpan)({ ["uploadBackup.destination.googlecloud"]: "true" });
        (0, tracing_1.asyncRunInSpan)("app.admin.backup.uploadBackup.googlecloud", {
            attributes: {
                [tracing_1.SemanticAttributes.CODE_FUNCTION]: "uploadBackup.googlecloud",
                [tracing_1.SemanticAttributes.CODE_NAMESPACE]: "app.admin.backup",
            },
        }, async () => {
            try {
                const storage = new storage_1.Storage({
                    keyFilename: _config_1.GcsApplicationCredentials,
                });
                const bucket = storage.bucket(_config_1.LND_SCB_BACKUP_BUCKET_NAME);
                const file = bucket.file(`lnd_scb/${filename}`);
                await file.save(backup);
                logger.info({ backup }, "Static channel backup to GoogleCloud successful.");
                (0, tracing_1.addEventToCurrentSpan)("Static channel backup to GoogleCloud successful.");
            }
            catch (error) {
                logger.error({ error }, "Static channel backup to GoogleCloud failed.");
                (0, tracing_1.recordExceptionInCurrentSpan)({ error: error, level: shared_1.ErrorLevel.Warn });
            }
        });
    }
    if (!(_config_1.Nextcloudurl && _config_1.Nextclouduser && _config_1.Nextcloudpassword)) {
        (0, tracing_1.addAttributesToCurrentSpan)({ ["uploadBackup.destination.nextcloud"]: "false" });
    }
    else {
        (0, tracing_1.addAttributesToCurrentSpan)({ ["uploadBackup.destination.nextcloud"]: "true" });
        (0, tracing_1.asyncRunInSpan)("app.admin.backup.uploadBackup.nextcloud", {
            attributes: {
                [tracing_1.SemanticAttributes.CODE_FUNCTION]: "uploadBackup.nextcloud",
                [tracing_1.SemanticAttributes.CODE_NAMESPACE]: "app.admin.backup",
            },
        }, async () => {
            try {
                await axios_1.default.put(`${_config_1.Nextcloudurl}/${filename}`, backup, {
                    auth: {
                        username: `${_config_1.Nextclouduser}`,
                        password: `${_config_1.Nextcloudpassword}`,
                    },
                });
                logger.info({ backup }, "Static channel backup to Nextcloud successful.");
                (0, tracing_1.addEventToCurrentSpan)("Static channel backup to Nextcloud successful.");
            }
            catch (error) {
                logger.error({ error }, "Static channel backup to Nextcloud failed.");
                (0, tracing_1.recordExceptionInCurrentSpan)({ error: error, level: shared_1.ErrorLevel.Warn });
            }
        });
    }
};
exports.uploadBackup = uploadBackup;
//# sourceMappingURL=backup.js.map