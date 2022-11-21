"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeSDLFile = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const prettier_1 = __importDefault(require("prettier"));
const writeSDLFile = async (filePath, content) => {
    const prettierConfig = await prettier_1.default.resolveConfig(__filename);
    if (!prettierConfig) {
        throw new Error("Prettier config not found");
    }
    const formattedContent = prettier_1.default.format(content, {
        ...prettierConfig,
        parser: "graphql",
    });
    return promises_1.default.writeFile(path_1.default.resolve(filePath), formattedContent);
};
exports.writeSDLFile = writeSDLFile;
//# sourceMappingURL=fs.js.map