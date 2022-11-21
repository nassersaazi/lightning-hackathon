"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebalanceToColdWallet = void 0;
const prices_1 = require("../prices");
const _config_1 = require("../../config/index");
const bitcoin_1 = require("../../domain/bitcoin");
const onchain_1 = require("../../domain/bitcoin/onchain");
const cold_storage_1 = require("../../domain/cold-storage");
const display_currency_1 = require("../../domain/fiat/display-currency");
const lnd_1 = require("../../services/lnd");
const ledger_1 = require("../../services/ledger");
const cold_storage_2 = require("../../services/cold-storage");
const onchain_service_1 = require("../../services/lnd/onchain-service");
const tracing_1 = require("../../services/tracing");
const get_balances_1 = require("../lightning/get-balances");
const rebalanceToColdWallet = async () => {
    const coldStorageConfig = (0, _config_1.getColdStorageConfig)();
    const ledgerService = (0, ledger_1.LedgerService)();
    const coldStorageService = await (0, cold_storage_2.ColdStorageService)();
    if (coldStorageService instanceof Error)
        return coldStorageService;
    const onChainService = (0, onchain_service_1.OnChainService)((0, onchain_1.TxDecoder)(_config_1.BTC_NETWORK));
    if (onChainService instanceof Error)
        return onChainService;
    const offChainService = (0, lnd_1.LndService)();
    if (offChainService instanceof Error)
        return offChainService;
    const displayCurrencyPerSat = await (0, prices_1.getCurrentPrice)();
    if (displayCurrencyPerSat instanceof Error)
        return displayCurrencyPerSat;
    // we only need active node onchain balance, otherwise we would not be able to rebalance
    const onChainBalance = await onChainService.getBalance();
    if (onChainBalance instanceof Error)
        return onChainBalance;
    const offChainBalance = await (0, get_balances_1.getOffChainBalance)();
    if (offChainBalance instanceof Error)
        return offChainBalance;
    const rebalanceAmount = (0, cold_storage_1.RebalanceChecker)(coldStorageConfig).getWithdrawFromHotWalletAmount({
        onChainHotWalletBalance: onChainBalance,
        offChainHotWalletBalance: offChainBalance,
    });
    (0, tracing_1.addAttributesToCurrentSpan)({
        "rebalance.offChainBalance": offChainBalance,
        "rebalance.onChainBalance": onChainBalance,
        "rebalance.amount": rebalanceAmount,
    });
    if (rebalanceAmount <= 0)
        return false;
    const address = await coldStorageService.createOnChainAddress();
    if (address instanceof Error)
        return address;
    const txHash = await onChainService.payToAddress({
        address,
        amount: rebalanceAmount,
        targetConfirmations: coldStorageConfig.targetConfirmations,
    });
    if (txHash instanceof Error)
        return txHash;
    let fee = await onChainService.lookupOnChainFee({
        txHash,
        scanDepth: _config_1.ONCHAIN_SCAN_DEPTH_OUTGOING,
    });
    if (fee instanceof Error)
        fee = (0, bitcoin_1.toSats)(0);
    const description = `deposit of ${rebalanceAmount} sats to the cold storage wallet`;
    const converter = (0, display_currency_1.DisplayCurrencyConverter)(displayCurrencyPerSat);
    const amountDisplayCurrency = converter.fromSats(rebalanceAmount);
    const feeDisplayCurrency = converter.fromSats(fee);
    const journal = await ledgerService.addColdStorageTxReceive({
        txHash,
        description,
        sats: rebalanceAmount,
        fee,
        amountDisplayCurrency,
        feeDisplayCurrency,
        payeeAddress: address,
    });
    if (journal instanceof Error)
        return journal;
    return true;
};
exports.rebalanceToColdWallet = rebalanceToColdWallet;
//# sourceMappingURL=rebalance-to-cold-wallet.js.map