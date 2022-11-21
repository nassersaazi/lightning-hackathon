"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioClient = void 0;
const twilio_1 = __importDefault(require("twilio"));
const _config_1 = require("../config/index");
const phone_provider_1 = require("../domain/phone-provider");
const logger_1 = require("./logger");
const tracing_1 = require("./tracing");
const TwilioClient = () => {
    const client = (0, twilio_1.default)((0, _config_1.getTwilioConfig)().accountSid, (0, _config_1.getTwilioConfig)().authToken);
    const sendText = async ({ body, to, logger }) => {
        const twilioPhoneNumber = (0, _config_1.getTwilioConfig)().twilioPhoneNumber;
        try {
            await client.messages.create({
                from: twilioPhoneNumber,
                to,
                body,
            });
        }
        catch (err) {
            logger.error({ err }, "impossible to send text");
            const invalidNumberMessages = ["not a valid phone number", "not a mobile number"];
            if (invalidNumberMessages.some((m) => err.message.includes(m))) {
                return new phone_provider_1.InvalidPhoneNumberPhoneProviderError(err);
            }
            if (err.message.includes("has not been enabled for the region")) {
                return new phone_provider_1.RestrictedRegionPhoneProviderError(err);
            }
            if (err.message.includes("unsubscribed recipient")) {
                return new phone_provider_1.UnsubscribedRecipientPhoneProviderError(err);
            }
            if (err.message.includes("timeout of") && err.message.includes("exceeded")) {
                return new phone_provider_1.PhoneProviderConnectionError(err);
            }
            return new phone_provider_1.UnknownPhoneProviderServiceError(err);
        }
        logger.info({ to }, "sent text successfully");
        return true;
    };
    const getCarrier = async (phone) => {
        try {
            const result = await client.lookups.phoneNumbers(phone).fetch({ type: ["carrier"] });
            logger_1.baseLogger.info({ result }, "result carrier info");
            // TODO: migration to save the converted value to mongoose instead
            // of the one returned from twilio
            // const mappedValue = {
            //   carrier: {
            //     errorCode: result.carrier?.error_code,
            //     mobileCountryCode: result.carrier?.mobile_country_code,
            //     mobileNetworkCode: result.carrier?.mobile_network_code,
            //     name: result.carrier?.name,
            //     type: result.carrier?.type,
            //   },
            //   countryCode: result.countryCode,
            // }
            return result;
        }
        catch (err) {
            return new phone_provider_1.UnknownPhoneProviderServiceError(err);
        }
    };
    return (0, tracing_1.wrapAsyncFunctionsToRunInSpan)({
        namespace: "services.twilio",
        fns: { getCarrier, sendText },
    });
};
exports.TwilioClient = TwilioClient;
//# sourceMappingURL=twilio.js.map