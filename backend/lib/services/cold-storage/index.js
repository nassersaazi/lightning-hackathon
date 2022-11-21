"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColdStorageService = void 0;
const bitcoin_core_ts_1 = __importDefault(require("bitcoin-core-ts"));
const bitcoin_1 = require("../../domain/bitcoin");
const _config_1 = require("../../config/index");
const errors_1 = require("../../domain/cold-storage/errors");
const onchain_1 = require("../../domain/bitcoin/onchain");
const tracing_1 = require("../tracing");
const { onChainWallet, walletPattern } = (0, _config_1.getColdStorageConfig)();
const ColdStorageService = async () => {
    const bitcoindCurrentWalletClient = await getBitcoindCurrentWalletClient();
    if (bitcoindCurrentWalletClient instanceof Error)
        return bitcoindCurrentWalletClient;
    const listWallets = async () => {
        try {
            const client = await getBitcoindClient();
            if (client instanceof Error)
                return client;
            const wallets = await client.listWallets();
            return wallets.filter((item) => item.includes(walletPattern));
        }
        catch (err) {
            return new errors_1.UnknownColdStorageServiceError(err);
        }
    };
    const getBalances = async () => {
        try {
            const coldStorageWallets = await listWallets();
            if (coldStorageWallets instanceof Error)
                return coldStorageWallets;
            const balances = [];
            for await (const walletName of coldStorageWallets) {
                const client = await getBitcoindClient(walletName);
                if (client instanceof Error)
                    continue;
                const amount = (0, bitcoin_1.btc2sat)(await client.getBalance());
                balances.push({ walletName, amount });
            }
            return balances;
        }
        catch (err) {
            return new errors_1.UnknownColdStorageServiceError(err);
        }
    };
    const getBalance = async (walletName) => {
        try {
            const client = await getBitcoindClient(walletName);
            if (client instanceof Error)
                client;
            const amount = (0, bitcoin_1.btc2sat)(await client.getBalance());
            return { walletName, amount };
        }
        catch (err) {
            return new errors_1.UnknownColdStorageServiceError(err);
        }
    };
    const createPsbt = async ({ walletName, onChainAddress, amount, targetConfirmations, }) => {
        try {
            const client = await getBitcoindClient(walletName);
            if (client instanceof Error)
                return client;
            const output0 = {};
            output0[onChainAddress] = (0, bitcoin_1.sat2btc)(amount);
            const fundedPsbt = await client.walletCreateFundedPsbt({
                inputs: [],
                outputs: [output0],
                options: { conf_target: targetConfirmations },
            });
            return {
                transaction: fundedPsbt.psbt,
                fee: (0, bitcoin_1.btc2sat)(fundedPsbt.fee),
            };
        }
        catch (err) {
            if (err && err.message && err.message.includes("Insufficient funds")) {
                return new errors_1.InsufficientBalanceForRebalanceError(err);
            }
            return new errors_1.UnknownColdStorageServiceError(err);
        }
    };
    const createOnChainAddress = async () => {
        try {
            return (0, onchain_1.checkedToOnChainAddress)({
                network: _config_1.BTC_NETWORK,
                value: await bitcoindCurrentWalletClient.getNewAddress(),
            });
        }
        catch (err) {
            return new errors_1.UnknownColdStorageServiceError(err);
        }
    };
    const isDerivedAddress = async (address) => {
        try {
            const { ismine: isMine } = await bitcoindCurrentWalletClient.getAddressInfo(address);
            return !!isMine;
        }
        catch (err) {
            return new errors_1.UnknownColdStorageServiceError(err);
        }
    };
    const isWithdrawalTransaction = async (txHash) => {
        try {
            const { amount } = await bitcoindCurrentWalletClient.getTransaction(txHash);
            return amount < 0;
        }
        catch (err) {
            if (err?.message === "Invalid or non-wallet transaction id")
                return new errors_1.InvalidOrNonWalletTransactionError(err);
            return new errors_1.UnknownColdStorageServiceError(err);
        }
    };
    const lookupTransactionFee = async (txHash) => {
        try {
            const { fee } = await bitcoindCurrentWalletClient.getTransaction(txHash);
            return (0, bitcoin_1.btc2sat)(Math.abs(fee));
        }
        catch (err) {
            return new errors_1.UnknownColdStorageServiceError(err);
        }
    };
    return (0, tracing_1.wrapAsyncFunctionsToRunInSpan)({
        namespace: "services.coldstorage",
        fns: {
            listWallets,
            getBalances,
            getBalance,
            createPsbt,
            createOnChainAddress,
            isDerivedAddress,
            isWithdrawalTransaction,
            lookupTransactionFee,
        },
    });
};
exports.ColdStorageService = ColdStorageService;
const getBitcoindClient = (wallet) => {
    try {
        const bitcoinCoreRPCConfig = (0, _config_1.getBitcoinCoreRPCConfig)();
        return new bitcoin_core_ts_1.default({ ...bitcoinCoreRPCConfig, wallet });
    }
    catch (err) {
        return new errors_1.UnknownColdStorageServiceError(err);
    }
};
const getBitcoindCurrentWalletClient = async () => {
    try {
        const client = getBitcoindClient();
        if (client instanceof Error)
            return client;
        const wallets = await client.listWallets();
        const wallet = wallets
            .filter((item) => item.includes(walletPattern))
            .find((item) => item.includes(onChainWallet));
        if (wallet)
            return getBitcoindClient(wallet);
        return new errors_1.InvalidCurrentColdStorageWalletServiceError();
    }
    catch (err) {
        return new errors_1.UnknownColdStorageServiceError(err);
    }
};
//# sourceMappingURL=index.js.map