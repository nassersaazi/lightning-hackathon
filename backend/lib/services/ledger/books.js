"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediciEntryFromPackage = exports.TransactionMetadata = exports.Transaction = exports.MainBook = void 0;
const medici_1 = require("medici");
Object.defineProperty(exports, "MediciEntryFromPackage", { enumerable: true, get: function () { return medici_1.Entry; } });
const schema_1 = require("./schema");
Object.defineProperty(exports, "Transaction", { enumerable: true, get: function () { return schema_1.Transaction; } });
Object.defineProperty(exports, "TransactionMetadata", { enumerable: true, get: function () { return schema_1.TransactionMetadata; } });
exports.MainBook = new medici_1.Book("MainBook");
//# sourceMappingURL=books.js.map