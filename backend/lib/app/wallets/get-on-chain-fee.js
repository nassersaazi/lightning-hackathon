"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnChainFee = void 0;
const _config_1 = require("../../config/index");
const bitcoin_1 = require("../../domain/bitcoin");
const onchain_1 = require("../../domain/bitcoin/onchain");
const errors_1 = require("../../domain/errors");
const imbalance_calculator_1 = require("../../domain/ledger/imbalance-calculator");
const wallets_1 = require("../../domain/wallets");
const ledger_1 = require("../../services/ledger");
const onchain_service_1 = require("../../services/lnd/onchain-service");
const mongoose_1 = require("../../services/mongoose");
const tracing_1 = require("../../services/tracing");
const { dustThreshold } = (0, _config_1.getOnChainWalletConfig)();
const getOnChainFee = async ({ walletId, account, amount, address, targetConfirmations, }) => {
    const amountChecked = (0, bitcoin_1.checkedToSats)(amount);
    if (amountChecked instanceof Error)
        return amountChecked;
    const targetConfsChecked = (0, bitcoin_1.checkedToTargetConfs)(targetConfirmations);
    if (targetConfsChecked instanceof Error)
        return targetConfsChecked;
    const walletIdChecked = (0, wallets_1.checkedToWalletId)(walletId);
    if (walletIdChecked instanceof Error)
        return walletIdChecked;
    const walletsRepo = (0, mongoose_1.WalletsRepository)();
    const wallet = await walletsRepo.findById(walletIdChecked);
    if (wallet instanceof Error)
        return wallet;
    const minBankFee = (0, bitcoin_1.toSats)(account.withdrawFee);
    const feeConfig = (0, _config_1.getFeesConfig)();
    const withdrawFeeCalculator = (0, wallets_1.WithdrawalFeeCalculator)({
        feeRatio: feeConfig.withdrawRatio,
        thresholdImbalance: feeConfig.withdrawThreshold,
    });
    const payeeWallet = await walletsRepo.findByAddress(address);
    if (payeeWallet instanceof errors_1.UnknownRepositoryError)
        return payeeWallet;
    const isIntraLedger = !(payeeWallet instanceof errors_1.CouldNotFindWalletFromOnChainAddressError);
    if (isIntraLedger)
        return withdrawFeeCalculator.onChainIntraLedgerFee();
    if (amountChecked < dustThreshold) {
        return new errors_1.LessThanDustThresholdError(`Use lightning to send amounts less than ${dustThreshold}`);
    }
    const balance = await (0, ledger_1.LedgerService)().getWalletBalance(wallet.id);
    if (balance instanceof Error)
        return balance;
    // avoids lnd balance sniffing attack
    if (balance < amountChecked)
        return new errors_1.InsufficientBalanceError("Balance is too low");
    const onChainService = (0, onchain_service_1.OnChainService)((0, onchain_1.TxDecoder)(_config_1.BTC_NETWORK));
    if (onChainService instanceof Error)
        return onChainService;
    const minerFee = await onChainService.getOnChainFeeEstimate({
        amount: amountChecked,
        address,
        targetConfirmations: targetConfsChecked,
    });
    if (minerFee instanceof Error)
        return minerFee;
    (0, tracing_1.addAttributesToCurrentSpan)({ "payOnChainByWalletId.estimatedMinerFee": `${minerFee}` });
    const imbalanceCalculator = (0, imbalance_calculator_1.ImbalanceCalculator)({
        method: feeConfig.withdrawMethod,
        volumeLightningFn: (0, ledger_1.LedgerService)().lightningTxBaseVolumeSince,
        volumeOnChainFn: (0, ledger_1.LedgerService)().onChainTxBaseVolumeSince,
        sinceDaysAgo: feeConfig.withdrawDaysLookback,
    });
    const imbalance = await imbalanceCalculator.getSwapOutImbalance(walletId);
    if (imbalance instanceof Error)
        return imbalance;
    const fees = withdrawFeeCalculator.onChainWithdrawalFee({
        amount: amountChecked,
        minerFee,
        minBankFee,
        imbalance,
    });
    return fees.totalFee;
};
exports.getOnChainFee = getOnChainFee;
//# sourceMappingURL=get-on-chain-fee.js.map