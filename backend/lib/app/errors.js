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
exports.ApplicationErrors = void 0;
const SharedErrors = __importStar(require("../domain/shared/errors"));
const DomainErrors = __importStar(require("../domain/errors"));
const PaymentErrors = __importStar(require("../domain/payments/errors"));
const LedgerErrors = __importStar(require("../domain/ledger/errors"));
const OnChainErrors = __importStar(require("../domain/bitcoin/onchain/errors"));
const LightningErrors = __importStar(require("../domain/bitcoin/lightning/errors"));
const PriceServiceErrors = __importStar(require("../domain/price/errors"));
const LockServiceErrors = __importStar(require("../domain/lock/errors"));
const RateLimitServiceErrors = __importStar(require("../domain/rate-limit/errors"));
const IpFetcherErrors = __importStar(require("../domain/ipfetcher/errors"));
const AccountErrors = __importStar(require("../domain/accounts/errors"));
const NotificationsErrors = __importStar(require("../domain/notifications/errors"));
const CacheErrors = __importStar(require("../domain/cache/errors"));
const PhoneProviderServiceErrors = __importStar(require("../domain/phone-provider/errors"));
const ColdStorageServiceErrors = __importStar(require("../domain/cold-storage/errors"));
const DealerPriceErrors = __importStar(require("../domain/dealer-price/errors"));
const PubSubErrors = __importStar(require("../domain/pubsub/errors"));
const CaptchaErrors = __importStar(require("../domain/captcha/errors"));
const AuthenticationErrors = __importStar(require("../domain/authentication/errors"));
const LedgerFacadeErrors = __importStar(require("../services/ledger/domain/errors"));
exports.ApplicationErrors = {
    ...SharedErrors,
    ...DomainErrors,
    ...PaymentErrors,
    ...LedgerErrors,
    ...OnChainErrors,
    ...LightningErrors,
    ...PriceServiceErrors,
    ...LockServiceErrors,
    ...RateLimitServiceErrors,
    ...IpFetcherErrors,
    ...AccountErrors,
    ...NotificationsErrors,
    ...CacheErrors,
    ...PhoneProviderServiceErrors,
    ...ColdStorageServiceErrors,
    ...DealerPriceErrors,
    ...PubSubErrors,
    ...CaptchaErrors,
    ...AuthenticationErrors,
    ...LedgerFacadeErrors,
};
//# sourceMappingURL=errors.js.map