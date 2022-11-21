"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const success_payload_1 = __importDefault(require("../../types/payload/success-payload"));
const schema_1 = require("../../../services/mongoose/schema");
const utils_1 = require("../../../services/mongoose/utils");
const DeviceNotificationTokenCreateInput = index_1.GT.Input({
    name: "DeviceNotificationTokenCreateInput",
    fields: () => ({
        deviceToken: { type: index_1.GT.NonNull(index_1.GT.String) },
    }),
});
const DeviceNotificationTokenCreateMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(success_payload_1.default),
    args: {
        input: { type: index_1.GT.NonNull(DeviceNotificationTokenCreateInput) },
    },
    resolve: async (_, args, { domainUser }) => {
        const { deviceToken } = args.input;
        try {
            // FIXME: this should be moved to a use case
            const user = await schema_1.User.findOne({ _id: (0, utils_1.toObjectId)(domainUser.id) });
            if (!user)
                throw Error("find user issue");
            if (!user.deviceToken.includes(deviceToken)) {
                user.deviceToken.push(deviceToken);
            }
            await user.save();
        }
        catch (err) {
            return { errors: [{ message: err.message }] };
        }
        return { errors: [], success: true };
    },
});
exports.default = DeviceNotificationTokenCreateMutation;
//# sourceMappingURL=device-notification-token-create.js.map