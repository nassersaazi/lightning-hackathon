"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendSessions = void 0;
const shared_1 = require("../../domain/shared");
const kratos_1 = require("../../services/kratos");
// TODO: interface/type should be reworked so that it doesn't have to come from private
const private_1 = require("../../services/kratos/private");
const tracing_1 = require("../../services/tracing");
const extendSessions = async () => {
    const users = await (0, kratos_1.listIdentities)();
    if (users instanceof Error)
        throw users;
    for (const user of users) {
        const sessions = await (0, private_1.listSessionsInternal)(user.id);
        if (sessions instanceof Error) {
            (0, tracing_1.recordExceptionInCurrentSpan)({
                error: "impossible to get session",
                level: shared_1.ErrorLevel.Info,
                attributes: { user: user.id, phone: user.phone },
            });
            continue;
        }
        for (const session of sessions) {
            const res = await (0, kratos_1.extendSession)({ session });
            if (res instanceof Error) {
                (0, tracing_1.recordExceptionInCurrentSpan)({
                    error: "impossible to extend session",
                    level: shared_1.ErrorLevel.Info,
                    attributes: { user: user.id, phone: user.phone },
                });
            }
        }
    }
};
exports.extendSessions = extendSessions;
//# sourceMappingURL=index.js.map