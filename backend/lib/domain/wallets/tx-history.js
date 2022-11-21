"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletTransactionHistory = exports.translateMemo = void 0;
const _config_1 = require("../../config/index");
const bitcoin_1 = require("../bitcoin");
const fiat_1 = require("../fiat");
const ledger_1 = require("../ledger");
const shared_1 = require("../shared");
const tx_methods_1 = require("./tx-methods");
const tx_status_1 = require("./tx-status");
const filterPendingIncoming = ({ pendingIncoming, addressesByWalletId, walletDetailsByWalletId, displayCurrencyPerSat, }) => {
    const walletTransactions = [];
    pendingIncoming.forEach(({ rawTx, createdAt }) => {
        rawTx.outs.forEach(({ sats, address }) => {
            if (address) {
                for (const walletIdString in addressesByWalletId) {
                    const walletId = walletIdString;
                    if (addressesByWalletId[walletId].includes(address)) {
                        walletTransactions.push({
                            id: rawTx.txHash,
                            walletId,
                            settlementAmount: sats,
                            settlementFee: (0, bitcoin_1.toSats)(0),
                            settlementCurrency: walletDetailsByWalletId[walletId].currency,
                            displayCurrencyPerSettlementCurrencyUnit: displayCurrencyPerSat,
                            status: tx_status_1.TxStatus.Pending,
                            memo: null,
                            createdAt: createdAt,
                            initiationVia: {
                                type: tx_methods_1.PaymentInitiationMethod.OnChain,
                                address,
                            },
                            settlementVia: {
                                type: tx_methods_1.SettlementMethod.OnChain,
                                transactionHash: rawTx.txHash,
                            },
                        });
                    }
                }
            }
        });
    });
    return walletTransactions;
};
const translateLedgerTxnToWalletTxn = (txn) => {
    const { credit, debit, currency, fee, feeUsd, lnMemo, memoFromPayer } = txn;
    const settlementAmount = currency === shared_1.WalletCurrency.Btc ? (0, bitcoin_1.toSats)(credit - debit) : (0, fiat_1.toCents)(credit - debit);
    const settlementFee = currency === shared_1.WalletCurrency.Btc
        ? (0, bitcoin_1.toSats)(fee || 0)
        : (0, fiat_1.toCents)(feeUsd ? Math.floor(feeUsd * 100) : 0);
    const memo = (0, exports.translateMemo)({
        memoFromPayer,
        lnMemo,
        credit,
        currency,
    });
    const status = txn.pendingConfirmation ? tx_status_1.TxStatus.Pending : tx_status_1.TxStatus.Success;
    const baseTransaction = {
        id: txn.id,
        walletId: txn.walletId,
        settlementAmount,
        settlementFee,
        settlementCurrency: txn.currency,
        displayCurrencyPerSettlementCurrencyUnit: displayCurrencyPerBaseUnitFromAmounts({
            displayAmountAsNumber: txn.usd,
            settlementAmountInBaseAsNumber: settlementAmount,
        }),
        status,
        memo,
        createdAt: txn.timestamp,
    };
    let txType = txn.type;
    if (txn.type == ledger_1.LedgerTransactionType.IntraLedger && txn.paymentHash) {
        txType = ledger_1.LedgerTransactionType.LnIntraLedger;
    }
    const defaultOnChainAddress = "<no-address>";
    const { recipientWalletId, username, pubkey, paymentHash, txHash, address } = txn;
    let walletTransaction;
    switch (txType) {
        case ledger_1.LedgerTransactionType.IntraLedger:
        case ledger_1.LedgerTransactionType.WalletIdTradeIntraAccount:
            walletTransaction = {
                ...baseTransaction,
                initiationVia: {
                    type: tx_methods_1.PaymentInitiationMethod.IntraLedger,
                    counterPartyWalletId: recipientWalletId,
                    counterPartyUsername: username,
                },
                settlementVia: {
                    type: tx_methods_1.SettlementMethod.IntraLedger,
                    counterPartyWalletId: recipientWalletId,
                    counterPartyUsername: username,
                },
            };
            break;
        case ledger_1.LedgerTransactionType.OnchainIntraLedger:
        case ledger_1.LedgerTransactionType.OnChainTradeIntraAccount:
            walletTransaction = {
                ...baseTransaction,
                initiationVia: {
                    type: tx_methods_1.PaymentInitiationMethod.OnChain,
                    address: address || defaultOnChainAddress,
                },
                settlementVia: {
                    type: tx_methods_1.SettlementMethod.IntraLedger,
                    counterPartyWalletId: recipientWalletId,
                    counterPartyUsername: username || null,
                },
            };
            break;
        case ledger_1.LedgerTransactionType.OnchainPayment:
        case ledger_1.LedgerTransactionType.OnchainReceipt:
            walletTransaction = {
                ...baseTransaction,
                initiationVia: {
                    type: tx_methods_1.PaymentInitiationMethod.OnChain,
                    address: address || defaultOnChainAddress,
                },
                settlementVia: {
                    type: tx_methods_1.SettlementMethod.OnChain,
                    transactionHash: txHash,
                },
            };
            break;
        case ledger_1.LedgerTransactionType.LnIntraLedger:
        case ledger_1.LedgerTransactionType.LnTradeIntraAccount:
            walletTransaction = {
                ...baseTransaction,
                initiationVia: {
                    type: tx_methods_1.PaymentInitiationMethod.Lightning,
                    paymentHash: paymentHash,
                    pubkey: pubkey,
                },
                settlementVia: {
                    type: tx_methods_1.SettlementMethod.IntraLedger,
                    counterPartyWalletId: recipientWalletId,
                    counterPartyUsername: username || null,
                },
            };
            break;
        case ledger_1.LedgerTransactionType.Payment:
        case ledger_1.LedgerTransactionType.Invoice:
            walletTransaction = {
                ...baseTransaction,
                initiationVia: {
                    type: tx_methods_1.PaymentInitiationMethod.Lightning,
                    paymentHash: paymentHash,
                    pubkey: pubkey,
                },
                settlementVia: {
                    type: tx_methods_1.SettlementMethod.Lightning,
                    revealedPreImage: undefined,
                },
            };
            break;
        default:
            walletTransaction = {
                ...baseTransaction,
                initiationVia: {
                    type: tx_methods_1.PaymentInitiationMethod.IntraLedger,
                    counterPartyWalletId: recipientWalletId,
                    counterPartyUsername: username,
                },
                settlementVia: {
                    type: tx_methods_1.SettlementMethod.IntraLedger,
                    counterPartyWalletId: recipientWalletId,
                    counterPartyUsername: username || null,
                },
            };
    }
    return walletTransaction;
};
const translateLedgerTxnToWalletTxnWithMetadata = (txn) => {
    const walletTxn = translateLedgerTxnToWalletTxn(txn);
    let walletTxnWithMetadata = {
        hasMetadata: true,
        ...walletTxn,
    };
    if ("revealedPreImage" in txn) {
        if (walletTxnWithMetadata.settlementVia.type !== tx_methods_1.SettlementMethod.Lightning) {
            // TODO: return invalid-state error here and remove cast to 'WalletLnTransactionWithMetadata' just below
        }
        walletTxnWithMetadata = {
            ...walletTxnWithMetadata,
            settlementVia: {
                ...walletTxnWithMetadata.settlementVia,
                revealedPreImage: txn.revealedPreImage,
            },
        };
    }
    return walletTxnWithMetadata;
};
const fromLedger = (ledgerTransactions) => {
    const transactions = ledgerTransactions.map(translateLedgerTxnToWalletTxn);
    return {
        transactions,
        addPendingIncoming: (args) => ({
            transactions: [...filterPendingIncoming(args), ...transactions],
        }),
    };
};
const fromLedgerWithMetadata = (ledgerTransactions) => {
    const transactions = ledgerTransactions.map(translateLedgerTxnToWalletTxnWithMetadata);
    const addPendingIncoming = (args) => {
        const pendingTxnsWithMetadata = filterPendingIncoming(args).map((txn) => ({
            ...txn,
            hasMetadata: true,
        }));
        return {
            transactions: [...pendingTxnsWithMetadata, ...transactions],
        };
    };
    return {
        transactions,
        addPendingIncoming,
    };
};
const shouldDisplayMemo = ({ memo, credit, currency, }) => {
    if (isAuthorizedMemo(memo) || credit === 0)
        return true;
    if (currency === shared_1.WalletCurrency.Btc)
        return credit >= _config_1.MEMO_SHARING_SATS_THRESHOLD;
    return credit >= _config_1.MEMO_SHARING_CENTS_THRESHOLD;
};
const isAuthorizedMemo = (memo) => !!memo && Object.keys(_config_1.onboardingEarn).includes(memo);
const translateMemo = ({ memoFromPayer, lnMemo, credit, currency, }) => {
    const memo = memoFromPayer || lnMemo;
    if (shouldDisplayMemo({ memo, credit, currency })) {
        return memo || null;
    }
    return null;
};
exports.translateMemo = translateMemo;
exports.WalletTransactionHistory = {
    fromLedger,
    fromLedgerWithMetadata,
};
// TODO: refactor this to use PriceRatio eventually instead after
// 'usd' property removal from db
const displayCurrencyPerBaseUnitFromAmounts = ({ displayAmountAsNumber, settlementAmountInBaseAsNumber, }) => settlementAmountInBaseAsNumber === 0
    ? 0
    : Math.abs(displayAmountAsNumber / settlementAmountInBaseAsNumber);
//# sourceMappingURL=tx-history.js.map