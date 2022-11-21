"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvWalletsExport = void 0;
const ledger_1 = require("./");
const csv_writer_1 = require("csv-writer");
const headers_field = [
    "id",
    "walletId",
    "type",
    "credit",
    "debit",
    "fee",
    "currency",
    "timestamp",
    "pendingConfirmation",
    "journalId",
    "lnMemo",
    "usd",
    "feeUsd",
    "recipientWalletId",
    "username",
    "memoFromPayer",
    "paymentHash",
    "pubkey",
    "feeKnownInAdvance",
    "address",
    "txHash",
];
const header = headers_field.map((item) => ({ id: item, title: item }));
class CsvWalletsExport {
    constructor() {
        this.entries = [];
    }
    getBase64() {
        const csvWriter = (0, csv_writer_1.createObjectCsvStringifier)({
            header,
        });
        const header_stringify = csvWriter.getHeaderString();
        const records = csvWriter.stringifyRecords(this.entries);
        const str = header_stringify + records;
        // create buffer from string
        const binaryData = Buffer.from(str, "utf8");
        // decode buffer as base64
        const base64Data = binaryData.toString("base64");
        return base64Data;
    }
    async saveToDisk() {
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: "export_accounts.csv",
            header,
        });
        await csvWriter.writeRecords(this.entries);
        console.log("saving complete");
    }
    async addWallet(walletId) {
        // TODO: interface could be improved by returning self, so that it's
        // possible to run csv.addWallet(wallet).getBase64()
        const txs = await (0, ledger_1.LedgerService)().getTransactionsByWalletId(walletId);
        if (txs instanceof Error)
            return txs;
        this.entries.push(...txs);
    }
}
exports.CsvWalletsExport = CsvWalletsExport;
//# sourceMappingURL=csv-wallet-export.js.map