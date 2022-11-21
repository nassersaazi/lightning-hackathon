"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCSVForAccount = void 0;
const csv_wallet_export_1 = require("../../services/ledger/csv-wallet-export");
const mongoose_1 = require("../../services/mongoose");
const getCSVForAccount = async (accountId) => {
    const wallets = await (0, mongoose_1.WalletsRepository)().listByAccountId(accountId);
    if (wallets instanceof Error)
        return wallets;
    const csv = new csv_wallet_export_1.CsvWalletsExport();
    for (const wallet of wallets) {
        await csv.addWallet(wallet.id);
    }
    return csv.getBase64();
};
exports.getCSVForAccount = getCSVForAccount;
//# sourceMappingURL=get-csv-for-account.js.map