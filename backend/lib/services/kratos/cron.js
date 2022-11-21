"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendSession = void 0;
const private_1 = require("./private");
// TODO: should be a param in yaml
const schemaIdsToExtend = ["phone_no_password_v0"];
// not all identities need to be extended
// a schemaId attached to an itentity with Phone may need to be
// because login back with a phone number + code is both costly and have variable delivery time
// whereas a schemasId attached to an email + password may not need to have long session time
const extendSession = async ({ session, }) => {
    if (!schemaIdsToExtend.includes(session.identity.schema_id))
        return;
    await private_1.kratosAdmin.adminExtendSession(session.id);
};
exports.extendSession = extendSession;
//# sourceMappingURL=cron.js.map