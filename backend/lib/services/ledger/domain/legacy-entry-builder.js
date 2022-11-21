"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyEntryBuilder = void 0;
const shared_1 = require("../../../domain/shared");
const accounts_1 = require("./accounts");
const ZERO_SATS = {
    currency: shared_1.WalletCurrency.Btc,
    amount: 0n,
};
const calc = (0, shared_1.AmountCalculator)();
const LegacyEntryBuilder = ({ staticAccountIds, entry, metadata, }) => {
    const withFee = (fee) => {
        if (fee.amount > 0n) {
            entry.credit(staticAccountIds.bankOwnerAccountId, Number(fee.amount), {
                ...metadata,
                currency: fee.currency,
            });
        }
        return LegacyEntryBuilderDebit({ metadata, entry, fee, staticAccountIds });
    };
    const withoutFee = () => {
        return withFee(ZERO_SATS);
    };
    return {
        withFee,
        withoutFee,
    };
};
exports.LegacyEntryBuilder = LegacyEntryBuilder;
const LegacyEntryBuilderDebit = ({ entry, metadata, fee, staticAccountIds, }) => {
    const debitAccount = ({ accountId, amount, additionalMetadata, }) => {
        const debitMetadata = additionalMetadata
            ? { ...metadata, ...additionalMetadata }
            : metadata;
        entry.debit(accountId, Number(amount.amount), {
            ...debitMetadata,
            currency: amount.currency,
        });
        if (amount.currency === shared_1.WalletCurrency.Btc) {
            return LegacyEntryBuilderCreditWithBtcDebit({
                entry,
                metadata,
                fee,
                debitAmount: amount,
                staticAccountIds,
            });
        }
        return LegacyEntryBuilderCreditWithUsdDebit({
            entry,
            metadata,
            fee,
            debitAmount: amount,
            staticAccountIds,
        });
    };
    const debitLnd = (amount) => {
        entry.debit(accounts_1.lndLedgerAccountId, Number(amount.amount), {
            ...metadata,
            currency: amount.currency,
        });
        return LegacyEntryBuilderCreditWithBtcDebit({
            entry,
            metadata,
            fee,
            debitAmount: amount,
            staticAccountIds,
        });
    };
    return {
        debitAccount,
        debitLnd,
    };
};
const LegacyEntryBuilderCreditWithUsdDebit = ({ entry, metadata, debitAmount, staticAccountIds, fee, }) => {
    const creditLnd = (btcCreditAmount) => {
        withdrawUsdFromDealer({
            entry,
            metadata,
            staticAccountIds,
            btcAmount: btcCreditAmount,
            usdAmount: debitAmount,
        });
        const creditAmount = calc.sub(btcCreditAmount, fee);
        entry.credit(accounts_1.lndLedgerAccountId, Number(creditAmount.amount), {
            ...metadata,
            currency: btcCreditAmount.currency,
        });
        return removeZeroAmountEntries(entry);
    };
    const creditAccount = ({ accountId, amount, }) => {
        if (amount) {
            withdrawUsdFromDealer({
                entry,
                metadata,
                staticAccountIds,
                btcAmount: amount,
                usdAmount: debitAmount,
            });
        }
        const creditAmount = amount ? calc.sub(amount, fee) : debitAmount;
        entry.credit(accountId, Number(creditAmount.amount), {
            ...metadata,
            currency: creditAmount.currency,
        });
        return removeZeroAmountEntries(entry);
    };
    return {
        creditLnd,
        creditAccount,
    };
};
const LegacyEntryBuilderCreditWithBtcDebit = ({ entry, metadata, fee, debitAmount, staticAccountIds, }) => {
    const creditLnd = () => {
        const creditAmount = calc.sub(debitAmount, fee);
        entry.credit(accounts_1.lndLedgerAccountId, Number(creditAmount.amount), {
            ...metadata,
            currency: creditAmount.currency,
        });
        return removeZeroAmountEntries(entry);
    };
    const creditAccount = ({ accountId, amount, }) => {
        if (amount) {
            addUsdToDealer({
                entry,
                metadata,
                staticAccountIds,
                btcAmount: debitAmount,
                usdAmount: amount,
            });
        }
        const creditAmount = amount || calc.sub(debitAmount, fee);
        entry.credit(accountId, Number(creditAmount.amount), {
            ...metadata,
            currency: creditAmount.currency,
        });
        return removeZeroAmountEntries(entry);
    };
    return {
        creditLnd,
        creditAccount,
    };
};
const addUsdToDealer = ({ staticAccountIds: { dealerBtcAccountId, dealerUsdAccountId }, entry, btcAmount, usdAmount, metadata, }) => {
    entry.credit(dealerBtcAccountId, Number(btcAmount.amount), {
        ...metadata,
        currency: btcAmount.currency,
    });
    entry.debit(dealerUsdAccountId, Number(usdAmount.amount), {
        ...metadata,
        currency: usdAmount.currency,
    });
    return entry;
};
const withdrawUsdFromDealer = ({ staticAccountIds: { dealerBtcAccountId, dealerUsdAccountId }, entry, btcAmount, usdAmount, metadata, }) => {
    entry.debit(dealerBtcAccountId, Number(btcAmount.amount), {
        ...metadata,
        currency: btcAmount.currency,
    });
    entry.credit(dealerUsdAccountId, Number(usdAmount.amount), {
        ...metadata,
        currency: usdAmount.currency,
    });
    return entry;
};
const removeZeroAmountEntries = (entry) => {
    const updatedTransactions = entry.transactions.filter((txn) => !(txn.debit === 0 && txn.credit === 0));
    entry.transactions = updatedTransactions;
    return entry;
};
//# sourceMappingURL=legacy-entry-builder.js.map