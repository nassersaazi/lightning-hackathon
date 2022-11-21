"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryBuilder = void 0;
const shared_1 = require("../../../domain/shared");
const accounts_1 = require("./accounts");
const calc = (0, shared_1.AmountCalculator)();
const EntryBuilder = ({ staticAccountIds, entry, metadata, }) => {
    const withTotalAmount = ({ usdWithFees, btcWithFees, }) => {
        return EntryBuilderFee({
            entry,
            metadata,
            staticAccountIds,
            amountWithFees: {
                usdWithFees,
                btcWithFees,
            },
        });
    };
    return {
        withTotalAmount,
    };
};
exports.EntryBuilder = EntryBuilder;
const EntryBuilderFee = ({ entry, metadata, staticAccountIds, amountWithFees: { usdWithFees, btcWithFees }, }) => {
    const withBankFee = ({ btcBankFee, usdBankFee, }) => {
        if (btcBankFee.amount > 0n) {
            entry.credit(staticAccountIds.bankOwnerAccountId, Number(btcBankFee.amount), {
                ...metadata,
                currency: btcBankFee.currency,
            });
        }
        return EntryBuilderDebit({
            metadata,
            entry,
            amountWithFees: { usdWithFees, btcWithFees },
            bankFee: { btcBankFee, usdBankFee },
            staticAccountIds,
        });
    };
    return {
        withBankFee,
    };
};
const EntryBuilderDebit = ({ entry, metadata, staticAccountIds, amountWithFees: { usdWithFees, btcWithFees }, bankFee: { usdBankFee, btcBankFee }, }) => {
    const debitAccount = ({ accountDescriptor, additionalMetadata, }) => {
        const debitMetadata = additionalMetadata
            ? { ...metadata, ...additionalMetadata }
            : metadata;
        if (accountDescriptor.currency === shared_1.WalletCurrency.Btc) {
            entry.debit(accountDescriptor.id, Number(btcWithFees.amount), {
                ...debitMetadata,
                currency: btcWithFees.currency,
            });
        }
        else {
            entry.debit(accountDescriptor.id, Number(usdWithFees.amount), {
                ...debitMetadata,
                currency: usdWithFees.currency,
            });
        }
        return EntryBuilderCredit({
            entry,
            metadata,
            debitCurrency: accountDescriptor.currency,
            bankFee: {
                usdBankFee,
                btcBankFee,
            },
            amountWithFees: {
                usdWithFees,
                btcWithFees,
            },
            staticAccountIds,
        });
    };
    const debitLnd = () => {
        return debitAccount({ accountDescriptor: accounts_1.lndLedgerAccountDescriptor });
    };
    const debitColdStorage = () => {
        return debitAccount({ accountDescriptor: accounts_1.coldStorageAccountDescriptor });
    };
    return {
        debitAccount,
        debitLnd,
        debitColdStorage,
    };
};
const EntryBuilderCredit = ({ entry, metadata, bankFee: { usdBankFee, btcBankFee }, amountWithFees: { usdWithFees, btcWithFees }, debitCurrency, staticAccountIds, }) => {
    const creditLnd = () => creditAccount(accounts_1.lndLedgerAccountDescriptor);
    const creditColdStorage = () => creditAccount(accounts_1.coldStorageAccountDescriptor);
    const creditAccount = (accountDescriptor) => {
        let entryToReturn = entry;
        const usdWithOutFee = calc.sub(usdWithFees, usdBankFee);
        const btcWithOutFee = calc.sub(btcWithFees, btcBankFee);
        if (debitCurrency === shared_1.WalletCurrency.Usd &&
            accountDescriptor.currency === shared_1.WalletCurrency.Usd &&
            usdBankFee.amount > 0) {
            entryToReturn = addUsdToBtcConversionToEntry({
                entry,
                metadata,
                staticAccountIds,
                btcAmount: btcBankFee,
                usdAmount: usdBankFee,
            });
        }
        if (debitCurrency === shared_1.WalletCurrency.Usd &&
            accountDescriptor.currency === shared_1.WalletCurrency.Btc) {
            entryToReturn = addUsdToBtcConversionToEntry({
                entry,
                metadata,
                staticAccountIds,
                btcAmount: btcWithFees,
                usdAmount: usdWithFees,
            });
        }
        if (debitCurrency === shared_1.WalletCurrency.Btc &&
            accountDescriptor.currency === shared_1.WalletCurrency.Usd) {
            entryToReturn = addBtcToUsdConversionToDealer({
                entry,
                metadata,
                staticAccountIds,
                btcAmount: btcWithOutFee,
                usdAmount: usdWithOutFee,
            });
        }
        const creditAmount = accountDescriptor.currency === shared_1.WalletCurrency.Usd ? usdWithOutFee : btcWithOutFee;
        entryToReturn.credit(accountDescriptor.id, Number(creditAmount.amount), {
            ...metadata,
            currency: creditAmount.currency,
        });
        return removeZeroAmountEntries(entryToReturn);
    };
    return {
        creditLnd,
        creditAccount,
        creditColdStorage,
    };
};
const addBtcToUsdConversionToDealer = ({ staticAccountIds: { dealerBtcAccountId, dealerUsdAccountId }, entry, btcAmount, usdAmount, metadata, }) => {
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
const addUsdToBtcConversionToEntry = ({ staticAccountIds: { dealerBtcAccountId, dealerUsdAccountId }, entry, btcAmount, usdAmount, metadata, }) => {
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
//# sourceMappingURL=entry-builder.js.map