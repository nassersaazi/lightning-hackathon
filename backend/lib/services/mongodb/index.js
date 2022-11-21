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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMongoConnection = exports.ledgerAdmin = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Medici = __importStar(require("medici"));
const _config_1 = require("../../config/index");
const shared_1 = require("../../domain/shared");
const schema_1 = require("../lnd/schema");
const ledger_1 = require("../ledger");
const mongoose_2 = require("../mongoose");
const utils_1 = require("../mongoose/utils");
const schema_2 = require("../ledger/schema");
const logger_1 = require("../logger");
const schema_3 = require("../mongoose/schema");
exports.ledgerAdmin = (0, ledger_1.lazyLoadLedgerAdmin)({
    bankOwnerWalletResolver: async () => {
        const result = await schema_3.User.findOne({ role: "bankowner" }, { defaultWalletId: 1 });
        if (!result)
            throw new _config_1.ConfigError("missing bankowner");
        return result.defaultWalletId;
    },
    dealerBtcWalletResolver: async () => {
        const user = await schema_3.User.findOne({ role: "dealer" }, { id: 1 });
        if (!user)
            throw new _config_1.ConfigError("missing dealer");
        // FIXME remove the use of UserRecord when role if part of the AccountRepository
        const accountId = (0, utils_1.fromObjectId)(user._id);
        const wallets = await (0, mongoose_2.WalletsRepository)().listByAccountId(accountId);
        if (wallets instanceof Error) {
            logger_1.baseLogger.error({ err: wallets }, "Error while listing wallets for dealer");
            throw new _config_1.ConfigError("Couldn't load dealer wallets");
        }
        const wallet = wallets.find((wallet) => wallet.currency === shared_1.WalletCurrency.Btc);
        if (wallet === undefined)
            throw new _config_1.ConfigError("missing dealer btc wallet");
        return wallet.id;
    },
    dealerUsdWalletResolver: async () => {
        const user = await schema_3.User.findOne({ role: "dealer" }, { id: 1 });
        if (!user)
            throw new _config_1.ConfigError("missing dealer");
        // FIXME remove the use of UserRecord when role if part of the AccountRepository
        const accountId = (0, utils_1.fromObjectId)(user._id);
        const wallets = await (0, mongoose_2.WalletsRepository)().listByAccountId(accountId);
        if (wallets instanceof Error) {
            logger_1.baseLogger.error({ err: wallets }, "Error while listing wallets for dealer");
            throw new _config_1.ConfigError("Couldn't load dealer wallets");
        }
        const wallet = wallets.find((wallet) => wallet.currency === shared_1.WalletCurrency.Usd);
        if (wallet === undefined)
            throw new _config_1.ConfigError("missing dealer usd wallet");
        return wallet.id;
    },
    funderWalletResolver: async () => {
        const result = await schema_3.User.findOne({ role: "funder" }, { defaultWalletId: 1 });
        if (!result)
            throw new _config_1.ConfigError("missing funder");
        return result.defaultWalletId;
    },
});
// TODO add an event listenever if we got disconnecter from MongoDb
// after a first successful connection
const user = process.env.MONGODB_USER ?? "testGaloy";
const password = process.env.MONGODB_PASSWORD;
const address = process.env.MONGODB_ADDRESS ?? "mongodb";
const db = process.env.MONGODB_DATABASE ?? "galoy";
const path = `mongodb://${user}:${password}@${address}/${db}`;
const setupMongoConnection = async (syncIndexes = false) => {
    try {
        await mongoose_1.default.connect(path, { autoIndex: false });
    }
    catch (err) {
        logger_1.baseLogger.fatal({ err, user, address, db }, `error connecting to mongodb`);
        throw err;
    }
    try {
        mongoose_1.default.set("runValidators", true);
        if (syncIndexes) {
            await schema_3.DbMetadata.syncIndexes();
            await schema_1.LnPayment.syncIndexes();
            await Medici.syncIndexes();
            await schema_3.PaymentFlowState.syncIndexes();
            await schema_3.PhoneCode.syncIndexes();
            await schema_2.TransactionMetadata.syncIndexes();
            await schema_3.User.syncIndexes();
            await schema_3.Wallet.syncIndexes();
            await schema_3.WalletInvoice.syncIndexes();
        }
    }
    catch (err) {
        logger_1.baseLogger.fatal({ err, user, address, db }, `error setting the indexes`);
        throw err;
    }
    return mongoose_1.default;
};
exports.setupMongoConnection = setupMongoConnection;
//# sourceMappingURL=index.js.map