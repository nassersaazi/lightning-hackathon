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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsService = void 0;
const admin = __importStar(require("firebase-admin"));
const notifications_1 = require("../../domain/notifications");
const logger_1 = require("../logger");
const logger = logger_1.baseLogger.child({ module: "notifications" });
// The key GOOGLE_APPLICATION_CREDENTIALS should be set in production
// This key defined the path of the config file that include the key
// more info at https://firebase.google.com/docs/admin/setup
// TODO: mock up the function for devnet
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}
const PushNotificationsService = () => {
    const sendNotification = async ({ deviceToken, title, body, data, }) => {
        const message = {
            // if we set notification, it will appears on both background and quit stage for iOS.
            // if we don't set notification, this will appear for background but not quit stage
            // we may be able to use data only, but this should be implemented first:
            // https://rnfirebase.io/messaging/usage#background-application-state
            notification: { title },
            data: data || {},
        };
        if (body) {
            message.notification.body = body;
        }
        const tokens = Array.isArray(deviceToken) ? deviceToken : [deviceToken];
        const deviceTokens = tokens.filter((token) => token.length === 163);
        if (deviceTokens.length <= 0) {
            logger.info({ message, deviceToken }, "invalid token. skipping notification");
            return new notifications_1.InvalidDeviceNotificationsServiceError();
        }
        try {
            const response = await admin.messaging().sendToDevice(deviceTokens, message);
            logger.info({ response, deviceToken, message }, "notification was sent successfully");
            return true;
        }
        catch (err) {
            logger.error({ err, deviceToken, message }, "impossible to send notification");
            return new notifications_1.UnknownNotificationsServiceError(err?.message);
        }
    };
    return { sendNotification };
};
exports.PushNotificationsService = PushNotificationsService;
//# sourceMappingURL=push-notifications.js.map