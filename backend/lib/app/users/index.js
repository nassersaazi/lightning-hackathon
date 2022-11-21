"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const mongoose_1 = require("../../services/mongoose");
__exportStar(require("./get-user"), exports);
__exportStar(require("./login"), exports);
__exportStar(require("./request-phone-code"), exports);
__exportStar(require("./update-language"), exports);
const users = (0, mongoose_1.UsersRepository)();
const getUser = async (userId) => {
    return users.findById(userId);
};
exports.getUser = getUser;
//# sourceMappingURL=index.js.map