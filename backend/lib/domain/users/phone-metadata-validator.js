"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneMetadataValidator = void 0;
const errors_1 = require("../errors");
const PhoneMetadataValidator = ({ denyPhoneCountries, allowPhoneCountries, }) => {
    const validateForReward = (phoneMetadata) => {
        if (!phoneMetadata || !phoneMetadata.carrier || !phoneMetadata.countryCode)
            return new errors_1.MissingPhoneMetadataError();
        if (phoneMetadata.carrier.type === "voip")
            return new errors_1.InvalidPhoneMetadataTypeError();
        const countryCode = phoneMetadata.countryCode.toUpperCase();
        const allowed = allowPhoneCountries.length <= 0 || allowPhoneCountries.includes(countryCode);
        const denied = denyPhoneCountries.length > 0 && denyPhoneCountries.includes(countryCode);
        if (!allowed || denied)
            return new errors_1.InvalidPhoneMetadataCountryError();
        return true;
    };
    return {
        validateForReward,
    };
};
exports.PhoneMetadataValidator = PhoneMetadataValidator;
//# sourceMappingURL=phone-metadata-validator.js.map