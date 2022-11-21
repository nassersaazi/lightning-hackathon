"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightningPaymentFlowBuilder = void 0;
const shared_1 = require("../shared");
const errors_1 = require("../errors");
const wallets_1 = require("../wallets");
const payments_1 = require("./");
const get_intraledger_hash_1 = require("./get-intraledger-hash");
const lightning_1 = require("../bitcoin/lightning");
const _utils_1 = require("../../utils/index");
const errors_2 = require("./errors");
const ln_fees_1 = require("./ln-fees");
const price_ratio_1 = require("./price-ratio");
const payment_flow_1 = require("./payment-flow");
const LightningPaymentFlowBuilder = (config) => {
    const settlementMethodFromDestination = (destination) => {
        const settlementMethod = destination === undefined
            ? wallets_1.SettlementMethod.IntraLedger
            : config.localNodeIds.includes(destination)
                ? wallets_1.SettlementMethod.IntraLedger
                : wallets_1.SettlementMethod.Lightning;
        return {
            settlementMethod,
            btcProtocolFee: settlementMethod === wallets_1.SettlementMethod.IntraLedger
                ? (0, ln_fees_1.LnFees)().intraLedgerFees().btc
                : undefined,
            usdProtocolFee: settlementMethod === wallets_1.SettlementMethod.IntraLedger
                ? (0, ln_fees_1.LnFees)().intraLedgerFees().usd
                : undefined,
        };
    };
    const skipProbeFromInvoice = (invoice) => {
        const invoicePubkeySet = new _utils_1.ModifiedSet((0, lightning_1.parseFinalHopsFromInvoice)(invoice));
        const flaggedPubkeySet = new _utils_1.ModifiedSet(config.flaggedPubkeys);
        return invoicePubkeySet.intersect(flaggedPubkeySet).size > 0;
    };
    const withInvoice = (invoice) => {
        if (invoice.paymentAmount === null) {
            return LPFBWithError(new errors_2.InvalidLightningPaymentFlowBuilderStateError("withInvoice - paymentAmount missing"));
        }
        return LPFBWithInvoice({
            ...config,
            ...settlementMethodFromDestination(invoice.destination),
            paymentInitiationMethod: wallets_1.PaymentInitiationMethod.Lightning,
            paymentHash: invoice.paymentHash,
            btcPaymentAmount: invoice.paymentAmount,
            inputAmount: invoice.paymentAmount.amount,
            descriptionFromInvoice: invoice.description,
            skipProbeForDestination: skipProbeFromInvoice(invoice),
        });
    };
    const withNoAmountInvoice = ({ invoice, uncheckedAmount, }) => {
        return LPFBWithInvoice({
            ...config,
            ...settlementMethodFromDestination(invoice.destination),
            paymentInitiationMethod: wallets_1.PaymentInitiationMethod.Lightning,
            paymentHash: invoice.paymentHash,
            uncheckedAmount,
            descriptionFromInvoice: invoice.description,
            skipProbeForDestination: skipProbeFromInvoice(invoice),
        });
    };
    const withoutInvoice = ({ uncheckedAmount, description, }) => {
        return LPFBWithInvoice({
            ...config,
            ...settlementMethodFromDestination(undefined),
            paymentInitiationMethod: wallets_1.PaymentInitiationMethod.IntraLedger,
            intraLedgerHash: (0, get_intraledger_hash_1.generateIntraLedgerHash)(),
            uncheckedAmount,
            descriptionFromInvoice: description,
            skipProbeForDestination: false,
        });
    };
    return {
        withInvoice,
        withNoAmountInvoice,
        withoutInvoice,
    };
};
exports.LightningPaymentFlowBuilder = LightningPaymentFlowBuilder;
const LPFBWithInvoice = (state) => {
    const withSenderWallet = (senderWallet) => {
        const { id: senderWalletId, accountId: senderAccountId, } = senderWallet;
        const senderWalletCurrency = senderWallet.currency;
        if (state.uncheckedAmount !== undefined) {
            if (senderWalletCurrency === shared_1.WalletCurrency.Btc) {
                const paymentAmount = (0, payments_1.checkedToBtcPaymentAmount)(state.uncheckedAmount);
                if (paymentAmount instanceof shared_1.ValidationError) {
                    return LPFBWithError(paymentAmount);
                }
                return LPFBWithSenderWallet({
                    ...state,
                    senderWalletId,
                    senderWalletCurrency,
                    senderAccountId,
                    btcPaymentAmount: paymentAmount,
                    inputAmount: paymentAmount.amount,
                    btcProtocolFee: state.btcProtocolFee || (0, ln_fees_1.LnFees)().maxProtocolFee(paymentAmount),
                });
            }
            else {
                const paymentAmount = (0, payments_1.checkedToUsdPaymentAmount)(state.uncheckedAmount);
                if (paymentAmount instanceof shared_1.ValidationError) {
                    return LPFBWithError(paymentAmount);
                }
                return LPFBWithSenderWallet({
                    ...state,
                    senderWalletId,
                    senderWalletCurrency,
                    senderAccountId,
                    usdPaymentAmount: paymentAmount,
                    inputAmount: paymentAmount.amount,
                    usdProtocolFee: state.usdProtocolFee || (0, ln_fees_1.LnFees)().maxProtocolFee(paymentAmount),
                });
            }
        }
        const inputAmount = state.inputAmount;
        const btcPaymentAmount = state.btcPaymentAmount;
        if (inputAmount && btcPaymentAmount) {
            return LPFBWithSenderWallet({
                ...state,
                senderWalletId,
                senderWalletCurrency,
                senderAccountId,
                btcPaymentAmount,
                btcProtocolFee: state.btcProtocolFee || (0, ln_fees_1.LnFees)().maxProtocolFee(btcPaymentAmount),
                inputAmount,
            });
        }
        throw new Error("withSenderWallet impossible");
    };
    return {
        withSenderWallet,
    };
};
const LPFBWithSenderWallet = (state) => {
    const withoutRecipientWallet = () => {
        if (state.settlementMethod === wallets_1.SettlementMethod.IntraLedger) {
            return LPFBWithError(new errors_2.InvalidLightningPaymentFlowBuilderStateError("withoutRecipientWallet called but settlementMethod is IntraLedger"));
        }
        return LPFBWithRecipientWallet({ ...state });
    };
    const withRecipientWallet = ({ id: recipientWalletId, currency: recipientWalletCurrency, pubkey: recipientPubkey, usdPaymentAmount, username: recipientUsername, accountId: recipientAccountId, }) => {
        if (recipientWalletId === state.senderWalletId) {
            return LPFBWithError(new errors_1.SelfPaymentError());
        }
        if (recipientWalletCurrency === shared_1.WalletCurrency.Usd &&
            // This means (usdPaymentAmount === undefined XNOR state.uncheckedAmount === undefined)
            // XNOR => if both or neither are set we get here - else we're fine
            !!usdPaymentAmount === !!state.uncheckedAmount) {
            return LPFBWithError(new errors_2.InvalidLightningPaymentFlowBuilderStateError("withRecipientWallet incorrect combination of usdPaymentAmount and uncheckedAmount"));
        }
        return LPFBWithRecipientWallet({
            ...state,
            recipientWalletId,
            recipientWalletCurrency,
            recipientPubkey,
            recipientAccountId,
            recipientUsername,
            usdPaymentAmount: usdPaymentAmount || state.usdPaymentAmount,
        });
    };
    const isIntraLedger = () => state.settlementMethod === wallets_1.SettlementMethod.IntraLedger;
    return {
        withoutRecipientWallet,
        withRecipientWallet,
        isIntraLedger,
    };
};
const LPFBWithRecipientWallet = (state) => {
    const withConversion = ({ hedgeBuyUsd, hedgeSellUsd, mid, }) => {
        const stateWithCreatedAt = { ...state, createdAt: new Date(Date.now()) };
        const { btcPaymentAmount, usdPaymentAmount, btcProtocolFee, usdProtocolFee } = state;
        // Use mid price when no buy / sell required
        const noConversionRequired = (state.senderWalletCurrency === shared_1.WalletCurrency.Btc &&
            state.settlementMethod === wallets_1.SettlementMethod.Lightning) ||
            state.senderWalletCurrency ===
                state.recipientWalletCurrency;
        if (noConversionRequired) {
            if (btcPaymentAmount && btcProtocolFee) {
                if (usdPaymentAmount && usdProtocolFee) {
                    return LPFBWithConversion(new Promise((res) => res({
                        ...stateWithCreatedAt,
                        btcPaymentAmount,
                        usdPaymentAmount,
                        btcProtocolFee,
                        usdProtocolFee,
                    })));
                }
                const updatedStateFromBtcPaymentAmount = async (btcPaymentAmount) => {
                    const convertedAmount = await mid.usdFromBtc(btcPaymentAmount);
                    if (convertedAmount instanceof Error)
                        return convertedAmount;
                    const priceRatio = (0, price_ratio_1.PriceRatio)({
                        usd: convertedAmount,
                        btc: btcPaymentAmount,
                    });
                    if (priceRatio instanceof Error)
                        return priceRatio;
                    const usdProtocolFee = priceRatio.convertFromBtcToCeil(btcProtocolFee);
                    return {
                        ...stateWithCreatedAt,
                        btcPaymentAmount,
                        usdPaymentAmount: convertedAmount,
                        btcProtocolFee,
                        usdProtocolFee,
                    };
                };
                return LPFBWithConversion(updatedStateFromBtcPaymentAmount(btcPaymentAmount));
            }
            else if (usdPaymentAmount && usdProtocolFee) {
                const updatedStateFromUsdPaymentAmount = async (usdPaymentAmount) => {
                    const convertedAmount = await mid.btcFromUsd(usdPaymentAmount);
                    if (convertedAmount instanceof Error)
                        return convertedAmount;
                    const priceRatio = (0, price_ratio_1.PriceRatio)({
                        btc: convertedAmount,
                        usd: usdPaymentAmount,
                    });
                    if (priceRatio instanceof Error)
                        return priceRatio;
                    const btcProtocolFee = priceRatio.convertFromUsd(usdProtocolFee);
                    return {
                        ...stateWithCreatedAt,
                        btcPaymentAmount: convertedAmount,
                        usdPaymentAmount,
                        btcProtocolFee,
                        usdProtocolFee,
                    };
                };
                return LPFBWithConversion(updatedStateFromUsdPaymentAmount(usdPaymentAmount));
            }
            else {
                return LPFBWithError(new errors_2.InvalidLightningPaymentFlowBuilderStateError("withConversion - btcPaymentAmount || btcProtocolFee not set"));
            }
        }
        // Convert to usd if necessary
        if (btcPaymentAmount && btcProtocolFee) {
            // We already know usd amount from the recipient invoice
            if (state.recipientWalletCurrency === shared_1.WalletCurrency.Usd &&
                usdPaymentAmount &&
                usdProtocolFee) {
                return LPFBWithConversion(Promise.resolve({
                    ...stateWithCreatedAt,
                    btcPaymentAmount,
                    usdPaymentAmount,
                    btcProtocolFee,
                    usdProtocolFee,
                }));
            }
            const updatedStateFromBtcPaymentAmount = async (btcPaymentAmount) => {
                const usdFromBtc = state.senderWalletCurrency === shared_1.WalletCurrency.Btc
                    ? hedgeBuyUsd.usdFromBtc
                    : hedgeSellUsd.usdFromBtc;
                const convertedAmount = await usdFromBtc(btcPaymentAmount);
                if (convertedAmount instanceof Error)
                    return convertedAmount;
                const priceRatio = (0, price_ratio_1.PriceRatio)({
                    usd: convertedAmount,
                    btc: btcPaymentAmount,
                });
                if (priceRatio instanceof Error)
                    return priceRatio;
                const usdProtocolFee = priceRatio.convertFromBtcToCeil(btcProtocolFee);
                return {
                    ...stateWithCreatedAt,
                    btcPaymentAmount,
                    usdPaymentAmount: convertedAmount,
                    btcProtocolFee,
                    usdProtocolFee,
                };
            };
            return LPFBWithConversion(updatedStateFromBtcPaymentAmount(btcPaymentAmount));
        }
        if (usdPaymentAmount && usdProtocolFee) {
            const updatedStateFromUsdPaymentAmount = async (usdPaymentAmount) => {
                const btcFromUsd = state.senderWalletCurrency === shared_1.WalletCurrency.Btc
                    ? hedgeBuyUsd.btcFromUsd
                    : hedgeSellUsd.btcFromUsd;
                const convertedAmount = await btcFromUsd(usdPaymentAmount);
                if (convertedAmount instanceof Error)
                    return convertedAmount;
                const priceRatio = (0, price_ratio_1.PriceRatio)({
                    btc: convertedAmount,
                    usd: usdPaymentAmount,
                });
                if (priceRatio instanceof Error)
                    return priceRatio;
                const btcProtocolFee = priceRatio.convertFromUsd(usdProtocolFee);
                return {
                    ...stateWithCreatedAt,
                    btcPaymentAmount: convertedAmount,
                    usdPaymentAmount,
                    btcProtocolFee,
                    usdProtocolFee,
                };
            };
            return LPFBWithConversion(updatedStateFromUsdPaymentAmount(usdPaymentAmount));
        }
        return LPFBWithError(new errors_2.InvalidLightningPaymentFlowBuilderStateError("withConversion - impossible withConversion state"));
    };
    return {
        withConversion,
    };
};
const LPFBWithConversion = (statePromise) => {
    const paymentFromState = (state) => {
        const hash = state.paymentHash
            ? { paymentHash: state.paymentHash }
            : state.intraLedgerHash
                ? { intraLedgerHash: state.intraLedgerHash }
                : new errors_2.InvalidLightningPaymentFlowStateError();
        if (hash instanceof Error)
            return hash;
        return (0, payment_flow_1.PaymentFlow)({
            ...hash,
            senderWalletId: state.senderWalletId,
            senderWalletCurrency: state.senderWalletCurrency,
            senderAccountId: state.senderAccountId,
            recipientWalletId: state.recipientWalletId,
            recipientWalletCurrency: state.recipientWalletCurrency,
            recipientAccountId: state.recipientAccountId,
            recipientPubkey: state.recipientPubkey,
            recipientUsername: state.recipientUsername,
            descriptionFromInvoice: state.descriptionFromInvoice,
            skipProbeForDestination: state.skipProbeForDestination,
            btcPaymentAmount: state.btcPaymentAmount,
            usdPaymentAmount: state.usdPaymentAmount,
            inputAmount: state.inputAmount,
            createdAt: state.createdAt,
            paymentSentAndPending: false,
            settlementMethod: state.settlementMethod,
            paymentInitiationMethod: state.paymentInitiationMethod,
            btcProtocolFee: state.btcProtocolFee,
            usdProtocolFee: state.usdProtocolFee,
            outgoingNodePubkey: state.outgoingNodePubkey,
            cachedRoute: state.checkedRoute,
        });
    };
    const withoutRoute = async () => {
        const state = await statePromise;
        if (state instanceof Error)
            return state;
        return paymentFromState({
            ...state,
            outgoingNodePubkey: undefined,
            checkedRoute: undefined,
        });
    };
    const withRoute = async ({ pubkey, rawRoute, }) => {
        const state = await statePromise;
        if (state instanceof Error)
            return state;
        const priceRatio = (0, price_ratio_1.PriceRatio)({
            usd: state.usdPaymentAmount,
            btc: state.btcPaymentAmount,
        });
        if (priceRatio instanceof Error)
            return priceRatio;
        const btcProtocolFee = (0, ln_fees_1.LnFees)().feeFromRawRoute(rawRoute);
        if (btcProtocolFee instanceof Error)
            return btcProtocolFee;
        const usdProtocolFee = priceRatio.convertFromBtcToCeil(btcProtocolFee);
        return paymentFromState({
            ...state,
            outgoingNodePubkey: pubkey,
            checkedRoute: rawRoute,
            btcProtocolFee,
            usdProtocolFee,
        });
    };
    const btcPaymentAmount = async () => {
        const state = await statePromise;
        if (state instanceof Error)
            return state;
        return state.btcPaymentAmount;
    };
    const usdPaymentAmount = async () => {
        const state = await statePromise;
        if (state instanceof Error)
            return state;
        return state.usdPaymentAmount;
    };
    const skipProbeForDestination = async () => {
        const state = await statePromise;
        if (state instanceof Error)
            return state;
        return state.skipProbeForDestination;
    };
    const isIntraLedger = async () => {
        const state = await statePromise;
        if (state instanceof Error)
            return state;
        return state.settlementMethod === wallets_1.SettlementMethod.IntraLedger;
    };
    const isTradeIntraAccount = async () => {
        const state = await statePromise;
        if (state instanceof Error)
            return state;
        return (state.senderAccountId === state.recipientAccountId &&
            state.senderWalletCurrency !==
                state.recipientWalletCurrency);
    };
    return {
        withRoute,
        withoutRoute,
        btcPaymentAmount,
        usdPaymentAmount,
        skipProbeForDestination,
        isIntraLedger,
        isTradeIntraAccount,
    };
};
const LPFBWithError = (error) => {
    const withSenderWallet = () => {
        return LPFBWithError(error);
    };
    const withoutRecipientWallet = () => {
        return LPFBWithError(error);
    };
    const withRecipientWallet = () => {
        return LPFBWithError(error);
    };
    const withConversion = () => {
        return LPFBWithError(error);
    };
    const withRoute = async () => {
        return Promise.resolve(error);
    };
    const withoutRoute = async () => {
        return Promise.resolve(error);
    };
    const skipProbeForDestination = async () => {
        return Promise.resolve(error);
    };
    const isIntraLedger = async () => {
        return Promise.resolve(error);
    };
    const isTradeIntraAccount = async () => {
        return Promise.resolve(error);
    };
    const btcPaymentAmount = async () => {
        return Promise.resolve(error);
    };
    const usdPaymentAmount = async () => {
        return Promise.resolve(error);
    };
    return {
        withSenderWallet,
        withoutRecipientWallet,
        withRecipientWallet,
        withConversion,
        skipProbeForDestination,
        isIntraLedger,
        isTradeIntraAccount,
        withRoute,
        withoutRoute,
        btcPaymentAmount,
        usdPaymentAmount,
    };
};
//# sourceMappingURL=payment-flow-builder.js.map