"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _app_1 = require("../../../../app/index");
const account_detail_1 = __importDefault(require("../../types/payload/account-detail"));
const error_map_1 = require("../../../error-map");
const index_1 = require("../../../index");
const username_1 = __importDefault(require("../../../types/scalar/username"));
const BusinessUpdateMapInfoInput = index_1.GT.Input({
    name: "BusinessUpdateMapInfoInput",
    fields: () => ({
        username: {
            type: index_1.GT.NonNull(username_1.default),
        },
        title: {
            type: index_1.GT.NonNull(index_1.GT.String),
        },
        longitude: {
            type: index_1.GT.NonNull(index_1.GT.Float),
        },
        latitude: {
            type: index_1.GT.NonNull(index_1.GT.Float),
        },
    }),
});
const BusinessUpdateMapInfoMutation = index_1.GT.Field({
    extensions: {
        complexity: 120,
    },
    type: index_1.GT.NonNull(account_detail_1.default),
    args: {
        input: { type: index_1.GT.NonNull(BusinessUpdateMapInfoInput) },
    },
    resolve: async (_, args) => {
        const { username, title, latitude, longitude } = args.input;
        for (const input of [username, title, latitude, longitude]) {
            if (input instanceof Error) {
                return { errors: [{ message: input.message }] };
            }
        }
        const coordinates = {
            latitude,
            longitude,
        };
        const account = await _app_1.Accounts.updateBusinessMapInfo({ username, title, coordinates });
        if (account instanceof Error) {
            return { errors: [(0, error_map_1.mapAndParseErrorForGqlResponse)(account)] };
        }
        return {
            errors: [],
            accountDetails: account,
        };
    },
});
exports.default = BusinessUpdateMapInfoMutation;
//# sourceMappingURL=business-update-map-info.js.map