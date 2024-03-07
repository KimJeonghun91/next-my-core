import { NextVanillaSpanAllowlist } from './constants';
let api;
// we want to allow users to use their own version of @opentelemetry/api if they
// want to, so we try to require it first, and if it fails we fall back to the
// version that is bundled with Next.js
// this is because @opentelemetry/api has to be synced with the version of
// @opentelemetry/tracing that is used, and we don't want to force users to use
// the version that is bundled with Next.js.
// the API is ~stable, so this should be fine
if (process.env.NEXT_RUNTIME === 'edge') {
    api = require('@opentelemetry/api');
}
else {
    try {
        api = require('@opentelemetry/api');
    }
    catch (err) {
        api = require('next/dist/compiled/@opentelemetry/api');
    }
}
const { context, propagation, trace, SpanStatusCode, SpanKind, ROOT_CONTEXT } = api;
const isPromise = (p) => {
    return p !== null && typeof p === 'object' && typeof p.then === 'function';
};
const closeSpanWithError = (span, error) => {
    if ((error === null || error === void 0 ? void 0 : error.bubble) === true) {
        span.setAttribute('next.bubble', true);
    }
    else {
        if (error) {
            span.recordException(error);
        }
        span.setStatus({ code: SpanStatusCode.ERROR, message: error === null || error === void 0 ? void 0 : error.message });
    }
    span.end();
};
/** we use this map to propagate attributes from nested spans to the top span */
const rootSpanAttributesStore = new Map();
const rootSpanIdKey = api.createContextKey('next.rootSpanId');
let lastSpanId = 0;
const getSpanId = () => lastSpanId++;
class NextTracerImpl {
    /**
     * Returns an instance to the trace with configured name.
     * Since wrap / trace can be defined in any place prior to actual trace subscriber initialization,
     * This should be lazily evaluated.
     */
    getTracerInstance() {
        return trace.getTracer('next.js', '0.0.1');
    }
    getContext() {
        return context;
    }
    getActiveScopeSpan() {
        return trace.getSpan(context === null || context === void 0 ? void 0 : context.active());
    }
    withPropagatedContext(carrier, fn, getter) {
        const activeContext = context.active();
        if (trace.getSpanContext(activeContext)) {
            // Active span is already set, too late to propagate.
            return fn();
        }
        const remoteContext = propagation.extract(activeContext, carrier, getter);
        return context.with(remoteContext, fn);
    }
    trace(...args) {
        var _a, _b, _c;
        const [type, fnOrOptions, fnOrEmpty] = args;
        // coerce options form overload
        const { fn, options, } = typeof fnOrOptions === 'function'
            ? {
                fn: fnOrOptions,
                options: {},
            }
            : {
                fn: fnOrEmpty,
                options: Object.assign({}, fnOrOptions),
            };
        if ((!NextVanillaSpanAllowlist.includes(type) &&
            process.env.NEXT_OTEL_VERBOSE !== '1') ||
            options.hideSpan) {
            return fn();
        }
        const spanName = (_a = options.spanName) !== null && _a !== void 0 ? _a : type;
        // Trying to get active scoped span to assign parent. If option specifies parent span manually, will try to use it.
        let spanContext = this.getSpanContext((_b = options === null || options === void 0 ? void 0 : options.parentSpan) !== null && _b !== void 0 ? _b : this.getActiveScopeSpan());
        let isRootSpan = false;
        if (!spanContext) {
            spanContext = ROOT_CONTEXT;
            isRootSpan = true;
        }
        else if ((_c = trace.getSpanContext(spanContext)) === null || _c === void 0 ? void 0 : _c.isRemote) {
            isRootSpan = true;
        }
        const spanId = getSpanId();
        options.attributes = Object.assign({ 'next.span_name': spanName, 'next.span_type': type }, options.attributes);
        return context.with(spanContext.setValue(rootSpanIdKey, spanId), () => this.getTracerInstance().startActiveSpan(spanName, options, (span) => {
            var _a;
            const onCleanup = () => {
                rootSpanAttributesStore.delete(spanId);
            };
            if (isRootSpan) {
                rootSpanAttributesStore.set(spanId, new Map(Object.entries((_a = options.attributes) !== null && _a !== void 0 ? _a : {})));
            }
            try {
                if (fn.length > 1) {
                    return fn(span, (err) => closeSpanWithError(span, err));
                }
                const result = fn(span);
                if (isPromise(result)) {
                    // If there's error make sure it throws
                    return result
                        .then((res) => {
                        span.end();
                        // Need to pass down the promise result,
                        // it could be react stream response with error { error, stream }
                        return res;
                    })
                        .catch((err) => {
                        closeSpanWithError(span, err);
                        throw err;
                    })
                        .finally(onCleanup);
                }
                else {
                    span.end();
                    onCleanup();
                }
                return result;
            }
            catch (err) {
                closeSpanWithError(span, err);
                onCleanup();
                throw err;
            }
        }));
    }
    wrap(...args) {
        const tracer = this;
        const [name, options, fn] = args.length === 3 ? args : [args[0], {}, args[1]];
        if (!NextVanillaSpanAllowlist.includes(name) &&
            process.env.NEXT_OTEL_VERBOSE !== '1') {
            return fn;
        }
        return function () {
            let optionsObj = options;
            if (typeof optionsObj === 'function' && typeof fn === 'function') {
                optionsObj = optionsObj.apply(this, arguments);
            }
            const lastArgId = arguments.length - 1;
            const cb = arguments[lastArgId];
            if (typeof cb === 'function') {
                const scopeBoundCb = tracer.getContext().bind(context.active(), cb);
                return tracer.trace(name, optionsObj, (_span, done) => {
                    arguments[lastArgId] = function (err) {
                        done === null || done === void 0 ? void 0 : done(err);
                        return scopeBoundCb.apply(this, arguments);
                    };
                    return fn.apply(this, arguments);
                });
            }
            else {
                return tracer.trace(name, optionsObj, () => fn.apply(this, arguments));
            }
        };
    }
    startSpan(...args) {
        var _a;
        const [type, options] = args;
        const spanContext = this.getSpanContext((_a = options === null || options === void 0 ? void 0 : options.parentSpan) !== null && _a !== void 0 ? _a : this.getActiveScopeSpan());
        return this.getTracerInstance().startSpan(type, options, spanContext);
    }
    getSpanContext(parentSpan) {
        const spanContext = parentSpan
            ? trace.setSpan(context.active(), parentSpan)
            : undefined;
        return spanContext;
    }
    getRootSpanAttributes() {
        const spanId = context.active().getValue(rootSpanIdKey);
        return rootSpanAttributesStore.get(spanId);
    }
}
const getTracer = (() => {
    const tracer = new NextTracerImpl();
    return () => tracer;
})();
export { getTracer, SpanStatusCode, SpanKind };
