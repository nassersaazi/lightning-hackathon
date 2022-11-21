"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneCodesRepository = void 0;
const errors_1 = require("../../domain/errors");
const utils_1 = require("./utils");
const schema_1 = require("./schema");
const PhoneCodesRepository = () => {
    const existNewerThan = async ({ phone, code, age, }) => {
        const timestamp = (Date.now() - age * 1000);
        try {
            const phoneCode = await schema_1.PhoneCode.findOne({
                phone,
                code,
                created_at: {
                    $gte: timestamp,
                },
            });
            if (!phoneCode) {
                return new errors_1.CouldNotFindPhoneCodeError();
            }
            return true;
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    const persistNew = async ({ phone, code, }) => {
        try {
            await schema_1.PhoneCode.create({ phone, code });
            return true;
        }
        catch (err) {
            return (0, utils_1.parseRepositoryError)(err);
        }
    };
    return {
        existNewerThan,
        persistNew,
    };
};
exports.PhoneCodesRepository = PhoneCodesRepository;
//# sourceMappingURL=phone-code.js.map