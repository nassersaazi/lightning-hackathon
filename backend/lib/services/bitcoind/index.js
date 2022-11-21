"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = exports.getBalancesDetail = exports.bitcoindDefaultClient = exports.BitcoindWalletClient = exports.BitcoindClient = void 0;
const bitcoin_1 = require("../../domain/bitcoin");
const bitcoin_core_ts_1 = __importDefault(require("bitcoin-core-ts"));
const lodash_sumby_1 = __importDefault(require("lodash.sumby"));
const connection_obj = {
    network: process.env.NETWORK,
    username: "rpcuser",
    password: process.env.BITCOINDRPCPASS,
    host: process.env.BITCOINDADDR,
    port: process.env.BITCOINDPORT,
    version: "0.21.0",
};
class BitcoindClient {
    constructor() {
        this.client = new bitcoin_core_ts_1.default({ ...connection_obj });
    }
    async getBlockCount() {
        return this.client.getBlockCount();
    }
    async getBlockchainInfo() {
        return this.client.getBlockchainInfo();
    }
    async createWallet({ walletName, disablePrivateKeys, descriptors, }) {
        return this.client.createWallet({
            wallet_name: walletName,
            disable_private_keys: disablePrivateKeys,
            descriptors,
        });
    }
    async listWallets() {
        return this.client.listWallets();
    }
    async listWalletDir() {
        return (await this.client.listWalletDir()).wallets;
    }
    // load/unload only used in tests, for now
    async loadWallet({ filename, }) {
        return this.client.loadWallet({ filename });
    }
    async unloadWallet({ walletName, }) {
        return this.client.unloadWallet({ wallet_name: walletName });
    }
}
exports.BitcoindClient = BitcoindClient;
class BitcoindWalletClient {
    constructor(walletName) {
        this.client = new bitcoin_core_ts_1.default({ ...connection_obj, wallet: walletName });
    }
    async getNewAddress() {
        return this.client.getNewAddress();
    }
    async getAddressInfo({ address }) {
        return this.client.getAddressInfo({ address });
    }
    async sendToAddress({ address, amount, }) {
        return this.client.sendToAddress({ address, amount });
    }
    async getTransaction({ txid, include_watchonly, }) {
        return this.client.getTransaction({ txid, include_watchonly });
    }
    async generateToAddress({ nblocks, address, }) {
        return this.client.generateToAddress({ nblocks, address });
    }
    async getBalance() {
        return this.client.getBalance();
    }
    async walletCreateFundedPsbt({ inputs, outputs, }) {
        return this.client.walletCreateFundedPsbt({ inputs, outputs });
    }
    async walletProcessPsbt({ psbt }) {
        return this.client.walletProcessPsbt({ psbt });
    }
    async finalizePsbt({ psbt, }) {
        return this.client.finalizePsbt({ psbt });
    }
    async sendRawTransaction({ hexstring }) {
        return this.client.sendRawTransaction({ hexstring });
    }
}
exports.BitcoindWalletClient = BitcoindWalletClient;
// The default client should remain without a wallet (not generate or receive bitcoin)
exports.bitcoindDefaultClient = new BitcoindClient();
const getBalancesDetail = async () => {
    const wallets = await exports.bitcoindDefaultClient.listWallets();
    const balances = [];
    for await (const wallet of wallets) {
        // do not consider the "outside" wallet in tests
        if (wallet === "" || wallet === "outside") {
            continue;
        }
        const client = new BitcoindWalletClient(wallet);
        const balance = (0, bitcoin_1.btc2sat)(await client.getBalance());
        balances.push({ wallet, balance });
    }
    return balances;
};
exports.getBalancesDetail = getBalancesDetail;
const getBalance = async () => {
    const balanceObj = await (0, exports.getBalancesDetail)();
    return (0, lodash_sumby_1.default)(balanceObj, "balance");
};
exports.getBalance = getBalance;
//# sourceMappingURL=index.js.map