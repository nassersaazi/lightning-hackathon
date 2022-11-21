"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubService = void 0;
const pubsub_1 = require("../domain/pubsub");
const redis_1 = require("./redis");
const PubSubService = () => {
    const createAsyncIterator = ({ trigger, }) => {
        try {
            return redis_1.redisPubSub.asyncIterator(trigger);
        }
        catch (err) {
            return new pubsub_1.UnknownPubSubError(err && err.message);
        }
    };
    const publish = async ({ trigger, payload, }) => {
        try {
            return await redis_1.redisPubSub.publish(trigger, payload);
        }
        catch (err) {
            return new pubsub_1.UnknownPubSubError(err && err.message);
        }
    };
    const publishImmediate = ({ trigger, payload, }) => {
        return setImmediate(() => setImmediate(() => publish({ trigger, payload })));
    };
    return {
        createAsyncIterator,
        publish,
        publishImmediate,
    };
};
exports.PubSubService = PubSubService;
//# sourceMappingURL=pubsub.js.map