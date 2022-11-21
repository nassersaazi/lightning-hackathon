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
exports.Swap = exports.Payments = exports.Wallets = exports.Users = exports.Prices = exports.Lightning = exports.ColdStorage = exports.Admin = exports.Accounts = void 0;
const tracing_1 = require("../services/tracing");
const AccountsMod = __importStar(require("./accounts"));
const AdminMod = __importStar(require("./admin"));
const ColdStorageMod = __importStar(require("./cold-storage"));
const LightningMod = __importStar(require("./lightning"));
const PricesMod = __importStar(require("./prices"));
const UsersMod = __importStar(require("./users"));
const WalletsMod = __importStar(require("./wallets"));
const PaymentsMod = __importStar(require("./payments"));
const SwapMod = __importStar(require("./swap"));
const allFunctions = {
    Accounts: { ...AccountsMod },
    Admin: { ...AdminMod },
    ColdStorage: { ...ColdStorageMod },
    Lightning: { ...LightningMod },
    Prices: { ...PricesMod },
    Users: { ...UsersMod },
    Wallets: { ...WalletsMod },
    Payments: { ...PaymentsMod },
    Swap: { ...SwapMod },
};
let subModule;
for (subModule in allFunctions) {
    for (const fn in allFunctions[subModule]) {
        /* eslint @typescript-eslint/ban-ts-comment: "off" */
        // @ts-ignore-next-line no-implicit-any error
        allFunctions[subModule][fn] = (0, tracing_1.wrapAsyncToRunInSpan)({
            namespace: `app.${subModule.toLowerCase()}`,
            // @ts-ignore-next-line no-implicit-any error
            fn: allFunctions[subModule][fn],
        });
    }
}
exports.Accounts = allFunctions.Accounts, exports.Admin = allFunctions.Admin, exports.ColdStorage = allFunctions.ColdStorage, exports.Lightning = allFunctions.Lightning, exports.Prices = allFunctions.Prices, exports.Users = allFunctions.Users, exports.Wallets = allFunctions.Wallets, exports.Payments = allFunctions.Payments, exports.Swap = allFunctions.Swap;
//# sourceMappingURL=index.js.map