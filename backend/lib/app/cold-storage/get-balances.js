"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalances = exports.listWallets = exports.getBalance = void 0;
const cold_storage_1 = require("../../services/cold-storage");
const getBalance = async (walletName) => {
    const coldStorageService = await (0, cold_storage_1.ColdStorageService)();
    if (coldStorageService instanceof Error)
        return coldStorageService;
    return coldStorageService.getBalance(walletName);
};
exports.getBalance = getBalance;
const listWallets = async () => {
    const coldStorageService = await (0, cold_storage_1.ColdStorageService)();
    if (coldStorageService instanceof Error)
        return coldStorageService;
    return coldStorageService.listWallets();
};
exports.listWallets = listWallets;
const getBalances = async () => {
    const coldStorageService = await (0, cold_storage_1.ColdStorageService)();
    if (coldStorageService instanceof Error)
        return coldStorageService;
    return coldStorageService.getBalances();
};
exports.getBalances = getBalances;
//# sourceMappingURL=get-balances.js.map