"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthWithPhonePasswordlessService = void 0;
const _config_1 = require("../../config/index");
const errors_1 = require("../../domain/authentication/errors");
const private_1 = require("./private");
// login with phone
const AuthWithPhonePasswordlessService = () => {
    const password = (0, _config_1.getKratosMasterPhonePassword)();
    const login = async (phone) => {
        const flow = await private_1.kratosPublic.initializeSelfServiceLoginFlowWithoutBrowser();
        const identifier = phone;
        const method = "password";
        let result;
        try {
            result = await private_1.kratosPublic.submitSelfServiceLoginFlow(flow.data.id, {
                identifier,
                method,
                password,
            });
        }
        catch (err) {
            if (err.message === "Request failed with status code 400") {
                return new errors_1.LikelyNoUserWithThisPhoneExistError(err);
            }
            if (err.message === "Request failed with status code 401") {
                return new errors_1.AuthenticationKratosError(err);
            }
            return new errors_1.UnknownKratosError(err);
        }
        const sessionToken = result.data.session_token;
        // note: this only works when whoami: required_aal = aal1
        const kratosUserId = result.data.session.identity.id;
        return { sessionToken, kratosUserId };
    };
    const createIdentityWithSession = async (phone) => {
        const flow = await private_1.kratosPublic.initializeSelfServiceRegistrationFlowWithoutBrowser();
        const traits = { phone };
        const method = "password";
        let result;
        try {
            result = await private_1.kratosPublic.submitSelfServiceRegistrationFlow(flow.data.id, {
                traits,
                method,
                password,
            });
        }
        catch (err) {
            if (err.message === "Request failed with status code 400") {
                return new errors_1.LikelyUserAlreadyExistError(err);
            }
            return new errors_1.UnknownKratosError(err);
        }
        const sessionToken = result.data.session_token;
        const kratosUserId = result.data.identity.id;
        return { sessionToken, kratosUserId };
    };
    const createIdentityNoSession = async (phone) => {
        const adminIdentity = {
            credentials: { password: { config: { password } } },
            state: "active",
            schema_id: "phone_no_password_v0",
            traits: { phone },
        };
        let kratosUserId;
        try {
            const { data: identity } = await private_1.kratosAdmin.adminCreateIdentity(adminIdentity);
            kratosUserId = identity.id;
        }
        catch (err) {
            if (err.message === "Request failed with status code 400") {
                return new errors_1.LikelyUserAlreadyExistError(err);
            }
            return new errors_1.UnknownKratosError(err);
        }
        return kratosUserId;
    };
    const upgradeToPhoneWithPasswordSchema = async ({ kratosUserId, password, }) => {
        let identity;
        try {
            ;
            ({ data: identity } = await private_1.kratosAdmin.adminGetIdentity(kratosUserId));
        }
        catch (err) {
            if (err.message === "Request failed with status code 400") {
                return new errors_1.LikelyUserAlreadyExistError(err);
            }
            return new errors_1.UnknownKratosError(err);
        }
        if (identity.schema_id !== "phone_no_password_v0") {
            return new errors_1.IncompatibleSchemaUpgradeError();
        }
        const adminIdentity = {
            ...identity,
            credentials: { password: { config: { password } } },
            state: "active",
            schema_id: "phone_with_password_v0",
        };
        const { data: newIdentity } = await private_1.kratosAdmin.adminUpdateIdentity(kratosUserId, adminIdentity);
        return (0, private_1.toDomainIdentityPhone)(newIdentity);
    };
    return {
        login,
        createIdentityWithSession,
        createIdentityNoSession,
        upgradeToPhoneWithPasswordSchema,
    };
};
exports.AuthWithPhonePasswordlessService = AuthWithPhonePasswordlessService;
//# sourceMappingURL=auth-phone-no-password.js.map