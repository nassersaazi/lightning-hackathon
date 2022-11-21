"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPMetadataValidator = void 0;
const errors_1 = require("../errors");
const IPMetadataValidator = ({ denyIPCountries, allowIPCountries, denyASNs, allowASNs, }) => {
    const validateForReward = (ipMetadata) => {
        if (!ipMetadata || !ipMetadata.isoCode || !ipMetadata.asn)
            return new errors_1.MissingIPMetadataError();
        if (ipMetadata.proxy)
            return new errors_1.InvalidIPMetadataProxyError();
        const isoCode = ipMetadata.isoCode.toUpperCase();
        const allowedCountry = allowIPCountries.length <= 0 || allowIPCountries.includes(isoCode);
        const deniedCountry = denyIPCountries.length > 0 && denyIPCountries.includes(isoCode);
        if (!allowedCountry || deniedCountry)
            return new errors_1.InvalidIPMetadataCountryError();
        const asn = ipMetadata.asn.toUpperCase();
        const allowedASN = allowASNs.length <= 0 || allowASNs.includes(asn);
        const deniedASN = denyASNs.length > 0 && denyASNs.includes(asn);
        if (!allowedASN || deniedASN)
            return new errors_1.InvalidIPMetadataASNError();
        return true;
    };
    return {
        validateForReward,
    };
};
exports.IPMetadataValidator = IPMetadataValidator;
//# sourceMappingURL=ip-metadata-validator.js.map