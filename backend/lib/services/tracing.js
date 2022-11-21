"use strict";
/* eslint @typescript-eslint/ban-ts-comment: "off" */
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCOUNT_USERNAME = exports.SemanticResourceAttributes = exports.SemanticAttributes = exports.shutdownTracing = exports.addAttributesToCurrentSpanAndPropagate = exports.wrapAsyncFunctionsToRunInSpan = exports.wrapAsyncToRunInSpan = exports.wrapToRunInSpan = exports.asyncRunInSpan = exports.recordExceptionInCurrentSpan = exports.addEventToCurrentSpan = exports.addAttributesToCurrentSpan = exports.tracer = void 0;
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
Object.defineProperty(exports, "SemanticAttributes", { enumerable: true, get: function () { return semantic_conventions_1.SemanticAttributes; } });
Object.defineProperty(exports, "SemanticResourceAttributes", { enumerable: true, get: function () { return semantic_conventions_1.SemanticResourceAttributes; } });
const core_1 = require("@opentelemetry/core");
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
const instrumentation_graphql_1 = require("@opentelemetry/instrumentation-graphql");
const instrumentation_mongodb_1 = require("@opentelemetry/instrumentation-mongodb");
const instrumentation_ioredis_1 = require("@opentelemetry/instrumentation-ioredis");
const instrumentation_grpc_1 = require("@opentelemetry/instrumentation-grpc");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const exporter_jaeger_1 = require("@opentelemetry/exporter-jaeger");
const resources_1 = require("@opentelemetry/resources");
const api_1 = require("@opentelemetry/api");
const _config_1 = require("../config/index");
const shared_1 = require("../domain/shared");
api_1.propagation.setGlobalPropagator(new core_1.W3CTraceContextPropagator());
// FYI this hook is executed BEFORE the `formatError` hook from apollo
// The data.errors field here may still change before being returned to the client
const gqlResponseHook = (span, data) => {
    if (data.errors && data.errors.length > 0) {
        recordGqlErrors({ errors: data.errors, span, subPathName: "" });
    }
    let gqlNestedKeys = [];
    if (data.data) {
        gqlNestedKeys = Object.keys(data.data);
    }
    for (const nestedObj of gqlNestedKeys) {
        const nestedObjData = data.data?.[nestedObj];
        if (!nestedObjData)
            continue;
        if (nestedObjData.errors && nestedObjData.errors.length > 0) {
            recordGqlErrors({ errors: nestedObjData.errors, span, subPathName: nestedObj });
        }
    }
};
const recordGqlErrors = ({ errors, span, subPathName, }) => {
    const subPath = subPathName ? `${subPathName}.` : "";
    recordException(span, {
        name: `graphql.${subPath}execution.error`,
        message: JSON.stringify(errors),
    }, shared_1.ErrorLevel.Warn);
    const setErrorAttribute = ({ attribute, value }) => span.setAttribute(`graphql.${subPath ? "data." : subPath}error.${attribute}`, value);
    const firstErr = errors[0];
    if (subPath) {
        setErrorAttribute({
            attribute: `operation.name`,
            value: subPath.split(".").join(""), // remove trailing '.'
        });
    }
    setErrorAttribute({
        attribute: "message",
        value: firstErr.message,
    });
    setErrorAttribute({
        attribute: "type",
        value: firstErr.constructor?.name,
    });
    setErrorAttribute({
        attribute: "path",
        value: firstErr.path,
    });
    setErrorAttribute({
        attribute: "code",
        value: firstErr.extensions?.code || firstErr.code,
    });
    if (firstErr.originalError) {
        setErrorAttribute({
            attribute: "original.type",
            value: firstErr.originalError.constructor?.name,
        });
        setErrorAttribute({
            attribute: "original.message",
            value: firstErr.originalError.message,
        });
    }
    // @ts-ignore-next-line no-implicit-any error
    errors.forEach((err, idx) => {
        setErrorAttribute({
            attribute: `${idx}.message`,
            value: err.message,
        });
        setErrorAttribute({
            attribute: `${idx}.type`,
            value: err.constructor?.name,
        });
        setErrorAttribute({
            attribute: `${idx}.path`,
            value: err.path,
        });
        setErrorAttribute({
            attribute: `${idx}.code`,
            value: err.extensions?.code || err.code,
        });
        if (err.originalError) {
            setErrorAttribute({
                attribute: `${idx}.original.type`,
                value: err.originalError.constructor?.name,
            });
            setErrorAttribute({
                attribute: `${idx}.original.message`,
                value: err.originalError.message,
            });
        }
    });
};
(0, instrumentation_1.registerInstrumentations)({
    instrumentations: [
        new instrumentation_http_1.HttpInstrumentation({
            ignoreIncomingPaths: ["/healthz"],
            headersToSpanAttributes: {
                server: {
                    requestHeaders: [
                        "apollographql-client-name",
                        "apollographql-client-version",
                        "x-real-ip",
                        "x-forwarded-for",
                        "user-agent",
                    ],
                },
            },
        }),
        new instrumentation_graphql_1.GraphQLInstrumentation({
            mergeItems: true,
            allowValues: true,
            responseHook: gqlResponseHook,
        }),
        new instrumentation_mongodb_1.MongoDBInstrumentation(),
        new instrumentation_grpc_1.GrpcInstrumentation(),
        new instrumentation_ioredis_1.IORedisInstrumentation(),
    ],
});
const provider = new sdk_trace_node_1.NodeTracerProvider({
    resource: resources_1.Resource.default().merge(new resources_1.Resource({
        [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: _config_1.tracingConfig?.tracingServiceName,
    })),
});
class SpanProcessorWrapper extends sdk_trace_base_1.SimpleSpanProcessor {
    onStart(span, parentContext) {
        const ctx = api_1.context.active();
        if (ctx) {
            const baggage = api_1.propagation.getBaggage(ctx);
            if (baggage) {
                baggage.getAllEntries().forEach(([key, entry]) => {
                    span.setAttribute(key, entry.value);
                });
            }
        }
        super.onStart(span, parentContext);
    }
}
provider.addSpanProcessor(new SpanProcessorWrapper(new exporter_jaeger_1.JaegerExporter({
    host: _config_1.tracingConfig?.jaegerHost,
    port: _config_1.tracingConfig?.jaegerPort,
})));
provider.register();
exports.tracer = api_1.trace.getTracer(_config_1.tracingConfig?.tracingServiceName, process.env.COMMITHASH || "dev");
const addAttributesToCurrentSpan = (attributes) => {
    const span = api_1.trace.getSpan(api_1.context.active());
    if (span) {
        for (const [key, value] of Object.entries(attributes)) {
            if (value) {
                span.setAttribute(key, value);
            }
        }
    }
};
exports.addAttributesToCurrentSpan = addAttributesToCurrentSpan;
const addEventToCurrentSpan = (name, attributesOrStartTime, startTime) => {
    const span = api_1.trace.getSpan(api_1.context.active());
    if (span) {
        span.addEvent(name, attributesOrStartTime, startTime);
    }
};
exports.addEventToCurrentSpan = addEventToCurrentSpan;
const recordExceptionInCurrentSpan = ({ error, level, attributes, }) => {
    const span = api_1.trace.getSpan(api_1.context.active());
    if (!span)
        return;
    if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            if (value)
                span.setAttribute(key, value);
        }
    }
    recordException(span, error, level);
};
exports.recordExceptionInCurrentSpan = recordExceptionInCurrentSpan;
const updateErrorForSpan = ({ span, errorLevel, }) => {
    const spanErrorRank = shared_1.RankedErrorLevel.indexOf(span.attributes["error.level"]);
    const errorRank = shared_1.RankedErrorLevel.indexOf(errorLevel);
    return errorRank >= spanErrorRank;
};
const recordException = (span, exception, level) => {
    const errorLevel = level || exception["level"] || shared_1.ErrorLevel.Warn;
    // Write error attributes if update checks pass
    if (updateErrorForSpan({ span, errorLevel })) {
        span.setAttribute("error.level", errorLevel);
        span.setAttribute("error.name", exception["name"]);
        span.setAttribute("error.message", exception["message"]);
    }
    // Append error with next index
    let nextIdx = 0;
    while (span.attributes[`error.${nextIdx}.level`] !== undefined) {
        nextIdx++;
    }
    span.setAttribute(`error.${nextIdx}.level`, errorLevel);
    span.setAttribute(`error.${nextIdx}.name`, exception["name"]);
    span.setAttribute(`error.${nextIdx}.message`, exception["message"]);
    span.recordException(exception);
    span.setStatus({ code: api_1.SpanStatusCode.ERROR });
};
const asyncRunInSpan = (spanName, options, fn) => {
    const ret = exports.tracer.startActiveSpan(spanName, options, async (span) => {
        try {
            const ret = await Promise.resolve(fn());
            if (ret instanceof Error) {
                recordException(span, ret);
            }
            span.end();
            return ret;
        }
        catch (error) {
            recordException(span, error, shared_1.ErrorLevel.Critical);
            span.end();
            throw error;
        }
    });
    return ret;
};
exports.asyncRunInSpan = asyncRunInSpan;
const resolveFunctionSpanOptions = ({ namespace, functionName, functionArgs, spanAttributes, root, }) => {
    const attributes = {
        [semantic_conventions_1.SemanticAttributes.CODE_FUNCTION]: functionName,
        [semantic_conventions_1.SemanticAttributes.CODE_NAMESPACE]: namespace,
        ...spanAttributes,
    };
    if (functionArgs && functionArgs.length > 0) {
        const params = typeof functionArgs[0] === "object" ? functionArgs[0] : { "0": functionArgs[0] };
        for (const key in params) {
            // @ts-ignore-next-line no-implicit-any error
            const value = params[key];
            attributes[`${semantic_conventions_1.SemanticAttributes.CODE_FUNCTION}.params.${key}`] = value;
            attributes[`${semantic_conventions_1.SemanticAttributes.CODE_FUNCTION}.params.${key}.null`] =
                value === null;
            attributes[`${semantic_conventions_1.SemanticAttributes.CODE_FUNCTION}.params.${key}.undefined`] =
                value === undefined;
        }
    }
    return { attributes, root };
};
const wrapToRunInSpan = ({ fn, fnName, namespace, spanAttributes, root, }) => {
    const functionName = fnName || fn.name || "unknown";
    const wrappedFn = (...args) => {
        const spanName = `${namespace}.${functionName}`;
        const spanOptions = resolveFunctionSpanOptions({
            namespace,
            functionName,
            functionArgs: args,
            spanAttributes,
            root,
        });
        const ret = exports.tracer.startActiveSpan(spanName, spanOptions, (span) => {
            try {
                const ret = fn(...args);
                if (ret instanceof Error)
                    recordException(span, ret);
                const partialRet = ret;
                if (partialRet?.partialResult && partialRet?.error)
                    recordException(span, partialRet.error);
                span.end();
                return ret;
            }
            catch (error) {
                recordException(span, error, shared_1.ErrorLevel.Critical);
                span.end();
                throw error;
            }
        });
        return ret;
    };
    // Re-add the original name to the wrapped function
    Object.defineProperty(wrappedFn, "name", {
        value: functionName,
        configurable: true,
    });
    return wrappedFn;
};
exports.wrapToRunInSpan = wrapToRunInSpan;
const wrapAsyncToRunInSpan = ({ fn, fnName, namespace, spanAttributes, root, }) => {
    const functionName = fnName || fn.name || "unknown";
    const wrappedFn = (...args) => {
        const spanName = `${namespace}.${functionName}`;
        const spanOptions = resolveFunctionSpanOptions({
            namespace,
            functionName,
            functionArgs: args,
            spanAttributes,
            root,
        });
        const ret = exports.tracer.startActiveSpan(spanName, spanOptions, async (span) => {
            try {
                const ret = await fn(...args);
                if (ret instanceof Error)
                    recordException(span, ret);
                const partialRet = ret;
                if (partialRet?.partialResult && partialRet?.error)
                    recordException(span, partialRet.error);
                span.end();
                return ret;
            }
            catch (error) {
                recordException(span, error, shared_1.ErrorLevel.Critical);
                span.end();
                throw error;
            }
        });
        return ret;
    };
    // Re-add the original name to the wrapped function
    Object.defineProperty(wrappedFn, "name", {
        value: functionName,
        configurable: true,
    });
    return wrappedFn;
};
exports.wrapAsyncToRunInSpan = wrapAsyncToRunInSpan;
const wrapAsyncFunctionsToRunInSpan = ({ namespace, fns, }) => {
    const functions = { ...fns };
    for (const fn of Object.keys(functions)) {
        const fnType = fns[fn].constructor.name;
        if (fnType === "Function") {
            functions[fn] = (0, exports.wrapToRunInSpan)({
                namespace,
                fn: fns[fn],
                fnName: fn,
            });
            continue;
        }
        if (fnType === "AsyncFunction") {
            functions[fn] = (0, exports.wrapAsyncToRunInSpan)({
                namespace,
                fn: fns[fn],
                fnName: fn,
            });
            continue;
        }
        functions[fn] = fns[fn];
    }
    return functions;
};
exports.wrapAsyncFunctionsToRunInSpan = wrapAsyncFunctionsToRunInSpan;
const addAttributesToCurrentSpanAndPropagate = (attributes, fn) => {
    const ctx = api_1.context.active();
    let baggage = api_1.propagation.getBaggage(ctx) || api_1.propagation.createBaggage();
    const currentSpan = api_1.trace.getSpan(ctx);
    Object.entries(attributes).forEach(([key, value]) => {
        if (value) {
            baggage = baggage.setEntry(key, { value });
            if (currentSpan) {
                currentSpan.setAttribute(key, value);
            }
        }
    });
    return api_1.context.with(api_1.propagation.setBaggage(ctx, baggage), fn);
};
exports.addAttributesToCurrentSpanAndPropagate = addAttributesToCurrentSpanAndPropagate;
const shutdownTracing = async () => {
    provider.shutdown();
};
exports.shutdownTracing = shutdownTracing;
exports.ACCOUNT_USERNAME = "account.username";
//# sourceMappingURL=tracing.js.map