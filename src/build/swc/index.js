var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
/* eslint-disable @typescript-eslint/no-use-before-define */
import path from 'path';
import { pathToFileURL } from 'url';
import { platform, arch } from 'os';
import { platformArchTriples } from 'next/dist/compiled/@napi-rs/triples';
import * as Log from '../output/log';
import { getParserOptions } from './options';
import { eventSwcLoadFailure } from '../../telemetry/events/swc-load-failure';
import { patchIncorrectLockfile } from '../../lib/patch-incorrect-lockfile';
import { downloadWasmSwc, downloadNativeNextSwc } from '../../lib/download-swc';
import { isDeepStrictEqual } from 'util';
import { getDefineEnv } from '../webpack/plugins/define-env-plugin';
const nextVersion = process.env.__NEXT_VERSION;
const ArchName = arch();
const PlatformName = platform();
const infoLog = (...args) => {
    if (process.env.NEXT_PRIVATE_BUILD_WORKER) {
        return;
    }
    if (process.env.DEBUG) {
        Log.info(...args);
    }
};
/**
 * Based on napi-rs's target triples, returns triples that have corresponding next-swc binaries.
 */
export const getSupportedArchTriples = () => {
    const { darwin, win32, linux, freebsd, android } = platformArchTriples;
    return {
        darwin,
        win32: {
            arm64: win32.arm64,
            ia32: win32.ia32.filter((triple) => triple.abi === 'msvc'),
            x64: win32.x64.filter((triple) => triple.abi === 'msvc'),
        },
        linux: {
            // linux[x64] includes `gnux32` abi, with x64 arch.
            x64: linux.x64.filter((triple) => triple.abi !== 'gnux32'),
            arm64: linux.arm64,
            // This target is being deprecated, however we keep it in `knownDefaultWasmFallbackTriples` for now
            arm: linux.arm,
        },
        // Below targets are being deprecated, however we keep it in `knownDefaultWasmFallbackTriples` for now
        freebsd: {
            x64: freebsd.x64,
        },
        android: {
            arm64: android.arm64,
            arm: android.arm,
        },
    };
};
const triples = (() => {
    var _a, _b;
    const supportedArchTriples = getSupportedArchTriples();
    const targetTriple = (_a = supportedArchTriples[PlatformName]) === null || _a === void 0 ? void 0 : _a[ArchName];
    // If we have supported triple, return it right away
    if (targetTriple) {
        return targetTriple;
    }
    // If there isn't corresponding target triple in `supportedArchTriples`, check if it's excluded from original raw triples
    // Otherwise, it is completely unsupported platforms.
    let rawTargetTriple = (_b = platformArchTriples[PlatformName]) === null || _b === void 0 ? void 0 : _b[ArchName];
    if (rawTargetTriple) {
        Log.warn(`Trying to load next-swc for target triple ${rawTargetTriple}, but there next-swc does not have native bindings support`);
    }
    else {
        Log.warn(`Trying to load next-swc for unsupported platforms ${PlatformName}/${ArchName}`);
    }
    return [];
})();
// Allow to specify an absolute path to the custom turbopack binary to load.
// If one of env variables is set, `loadNative` will try to use any turbo-* interfaces from specified
// binary instead. This will not affect existing swc's transform, or other interfaces. This is thin,
// naive interface - `loadBindings` will not validate neither path nor the binary.
//
// Note these are internal flag: there's no stability, feature guarantee.
const __INTERNAL_CUSTOM_TURBOPACK_BINDINGS = process.env.__INTERNAL_CUSTOM_TURBOPACK_BINDINGS;
function checkVersionMismatch(pkgData) {
    const version = pkgData.version;
    if (version && version !== nextVersion) {
        Log.warn(`Mismatching @next/swc version, detected: ${version} while Next.js is on ${nextVersion}. Please ensure these match`);
    }
}
// These are the platforms we'll try to load wasm bindings first,
// only try to load native bindings if loading wasm binding somehow fails.
// Fallback to native binding is for migration period only,
// once we can verify loading-wasm-first won't cause visible regressions,
// we'll not include native bindings for these platform at all.
const knownDefaultWasmFallbackTriples = [
    'x86_64-unknown-freebsd',
    'aarch64-linux-android',
    'arm-linux-androideabi',
    'armv7-unknown-linux-gnueabihf',
    'i686-pc-windows-msvc',
    // WOA targets are TBD, while current userbase is small we may support it in the future
    //'aarch64-pc-windows-msvc',
];
// The last attempt's error code returned when cjs require to native bindings fails.
// If node.js throws an error without error code, this should be `unknown` instead of undefined.
// For the wasm-first targets (`knownDefaultWasmFallbackTriples`) this will be `unsupported_target`.
let lastNativeBindingsLoadErrorCode = undefined;
let nativeBindings;
let wasmBindings;
let downloadWasmPromise;
let pendingBindings;
let swcTraceFlushGuard;
let swcHeapProfilerFlushGuard;
let downloadNativeBindingsPromise = undefined;
export const lockfilePatchPromise = {};
export async function loadBindings(useWasmBinary = false) {
    if (pendingBindings) {
        return pendingBindings;
    }
    // rust needs stdout to be blocking, otherwise it will throw an error (on macOS at least) when writing a lot of data (logs) to it
    // see https://github.com/napi-rs/napi-rs/issues/1630
    // and https://github.com/nodejs/node/blob/main/doc/api/process.md#a-note-on-process-io
    if (process.stdout._handle != null) {
        // @ts-ignore
        process.stdout._handle.setBlocking(true);
    }
    if (process.stderr._handle != null) {
        // @ts-ignore
        process.stderr._handle.setBlocking(true);
    }
    pendingBindings = new Promise(async (resolve, _reject) => {
        if (!lockfilePatchPromise.cur) {
            // always run lockfile check once so that it gets patched
            // even if it doesn't fail to load locally
            lockfilePatchPromise.cur = patchIncorrectLockfile(process.cwd()).catch(console.error);
        }
        let attempts = [];
        const disableWasmFallback = process.env.NEXT_DISABLE_SWC_WASM;
        const unsupportedPlatform = triples.some((triple) => !!(triple === null || triple === void 0 ? void 0 : triple.raw) && knownDefaultWasmFallbackTriples.includes(triple.raw));
        const isWebContainer = process.versions.webcontainer;
        const shouldLoadWasmFallbackFirst = (!disableWasmFallback && unsupportedPlatform && useWasmBinary) ||
            isWebContainer;
        if (!unsupportedPlatform && useWasmBinary) {
            Log.warn(`experimental.useWasmBinary is not an option for supported platform ${PlatformName}/${ArchName} and will be ignored.`);
        }
        if (shouldLoadWasmFallbackFirst) {
            lastNativeBindingsLoadErrorCode = 'unsupported_target';
            const fallbackBindings = await tryLoadWasmWithFallback(attempts);
            if (fallbackBindings) {
                return resolve(fallbackBindings);
            }
        }
        // Trickle down loading `fallback` bindings:
        //
        // - First, try to load native bindings installed in node_modules.
        // - If that fails with `ERR_MODULE_NOT_FOUND`, treat it as case of https://github.com/npm/cli/issues/4828
        // that host system where generated package lock is not matching to the guest system running on, try to manually
        // download corresponding target triple and load it. This won't be triggered if native bindings are failed to load
        // with other reasons than `ERR_MODULE_NOT_FOUND`.
        // - Lastly, falls back to wasm binding where possible.
        try {
            return resolve(loadNative());
        }
        catch (a) {
            if (Array.isArray(a) &&
                a.every((m) => m.includes('it was not installed'))) {
                let fallbackBindings = await tryLoadNativeWithFallback(attempts);
                if (fallbackBindings) {
                    return resolve(fallbackBindings);
                }
            }
            attempts = attempts.concat(a);
        }
        logLoadFailure(attempts, true);
    });
    return pendingBindings;
}
async function tryLoadNativeWithFallback(attempts) {
    const nativeBindingsDirectory = path.join(path.dirname(require.resolve('next/package.json')), 'next-swc-fallback');
    if (!downloadNativeBindingsPromise) {
        downloadNativeBindingsPromise = downloadNativeNextSwc(nextVersion, nativeBindingsDirectory, triples.map((triple) => triple.platformArchABI));
    }
    await downloadNativeBindingsPromise;
    try {
        let bindings = loadNative(nativeBindingsDirectory);
        return bindings;
    }
    catch (a) {
        attempts.concat(a);
    }
    return undefined;
}
async function tryLoadWasmWithFallback(attempts) {
    try {
        let bindings = await loadWasm('');
        // @ts-expect-error TODO: this event has a wrong type.
        eventSwcLoadFailure({
            wasm: 'enabled',
            nativeBindingsErrorCode: lastNativeBindingsLoadErrorCode,
        });
        return bindings;
    }
    catch (a) {
        attempts = attempts.concat(a);
    }
    try {
        // if not installed already download wasm package on-demand
        // we download to a custom directory instead of to node_modules
        // as node_module import attempts are cached and can't be re-attempted
        // x-ref: https://github.com/nodejs/modules/issues/307
        const wasmDirectory = path.join(path.dirname(require.resolve('next/package.json')), 'wasm');
        if (!downloadWasmPromise) {
            downloadWasmPromise = downloadWasmSwc(nextVersion, wasmDirectory);
        }
        await downloadWasmPromise;
        let bindings = await loadWasm(pathToFileURL(wasmDirectory).href);
        // @ts-expect-error TODO: this event has a wrong type.
        eventSwcLoadFailure({
            wasm: 'fallback',
            nativeBindingsErrorCode: lastNativeBindingsLoadErrorCode,
        });
        // still log native load attempts so user is
        // aware it failed and should be fixed
        for (const attempt of attempts) {
            Log.warn(attempt);
        }
        return bindings;
    }
    catch (a) {
        attempts = attempts.concat(a);
    }
}
function loadBindingsSync() {
    let attempts = [];
    try {
        return loadNative();
    }
    catch (a) {
        attempts = attempts.concat(a);
    }
    // we can leverage the wasm bindings if they are already
    // loaded
    if (wasmBindings) {
        return wasmBindings;
    }
    logLoadFailure(attempts);
}
let loggingLoadFailure = false;
function logLoadFailure(attempts, triedWasm = false) {
    // make sure we only emit the event and log the failure once
    if (loggingLoadFailure)
        return;
    loggingLoadFailure = true;
    for (let attempt of attempts) {
        Log.warn(attempt);
    }
    // @ts-expect-error TODO: this event has a wrong type.
    eventSwcLoadFailure({
        wasm: triedWasm ? 'failed' : undefined,
        nativeBindingsErrorCode: lastNativeBindingsLoadErrorCode,
    })
        .then(() => lockfilePatchPromise.cur || Promise.resolve())
        .finally(() => {
        Log.error(`Failed to load SWC binary for ${PlatformName}/${ArchName}, see more info here: https://nextjs.org/docs/messages/failed-loading-swc`);
        process.exit(1);
    });
}
export function createDefineEnv({ isTurbopack, allowedRevalidateHeaderKeys, clientRouterFilters, config, dev, distDir, fetchCacheKeyPrefix, hasRewrites, middlewareMatchers, previewModeId, }) {
    let defineEnv = {
        client: [],
        edge: [],
        nodejs: [],
    };
    for (const variant of Object.keys(defineEnv)) {
        defineEnv[variant] = rustifyEnv(getDefineEnv({
            isTurbopack,
            allowedRevalidateHeaderKeys,
            clientRouterFilters,
            config,
            dev,
            distDir,
            fetchCacheKeyPrefix,
            hasRewrites,
            isClient: variant === 'client',
            isEdgeServer: variant === 'edge',
            isNodeOrEdgeCompilation: variant === 'nodejs' || variant === 'edge',
            isNodeServer: variant === 'nodejs',
            middlewareMatchers,
            previewModeId,
        }));
    }
    return defineEnv;
}
function rustifyEnv(env) {
    return Object.entries(env)
        .filter(([_, value]) => value != null)
        .map(([name, value]) => ({
        name,
        value,
    }));
}
// TODO(sokra) Support wasm option.
function bindingToApi(binding, _wasm) {
    const cancel = new (class Cancel extends Error {
    })();
    /**
     * Utility function to ensure all variants of an enum are handled.
     */
    function invariant(never, computeMessage) {
        throw new Error(`Invariant: ${computeMessage(never)}`);
    }
    async function withErrorCause(fn) {
        try {
            return await fn();
        }
        catch (nativeError) {
            throw new Error(nativeError.message, { cause: nativeError });
        }
    }
    /**
     * Calls a native function and streams the result.
     * If useBuffer is true, all values will be preserved, potentially buffered
     * if consumed slower than produced. Else, only the latest value will be
     * preserved.
     */
    function subscribe(useBuffer, nativeFunction) {
        // A buffer of produced items. This will only contain values if the
        // consumer is slower than the producer.
        let buffer = [];
        // A deferred value waiting for the next produced item. This will only
        // exist if the consumer is faster than the producer.
        let waiting;
        let canceled = false;
        // The native function will call this every time it emits a new result. We
        // either need to notify a waiting consumer, or buffer the new result until
        // the consumer catches up.
        const emitResult = (err, value) => {
            if (waiting) {
                let { resolve, reject } = waiting;
                waiting = undefined;
                if (err)
                    reject(err);
                else
                    resolve(value);
            }
            else {
                const item = { err, value };
                if (useBuffer)
                    buffer.push(item);
                else
                    buffer[0] = item;
            }
        };
        const iterator = (function () {
            return __asyncGenerator(this, arguments, function* () {
                const task = yield __await(withErrorCause(() => nativeFunction(emitResult)));
                try {
                    while (!canceled) {
                        if (buffer.length > 0) {
                            const item = buffer.shift();
                            if (item.err)
                                throw item.err;
                            yield yield __await(item.value);
                        }
                        else {
                            // eslint-disable-next-line no-loop-func
                            yield yield __await(new Promise((resolve, reject) => {
                                waiting = { resolve, reject };
                            }));
                        }
                    }
                }
                catch (e) {
                    if (e === cancel)
                        return yield __await(void 0);
                    throw e;
                }
                finally {
                    binding.rootTaskDispose(task);
                }
            });
        })();
        iterator.return = async () => {
            canceled = true;
            if (waiting)
                waiting.reject(cancel);
            return { value: undefined, done: true };
        };
        return iterator;
    }
    async function rustifyProjectOptions(options) {
        return Object.assign(Object.assign({}, options), { nextConfig: options.nextConfig &&
                (await serializeNextConfig(options.nextConfig, options.projectPath)), jsConfig: options.jsConfig && JSON.stringify(options.jsConfig), env: options.env && rustifyEnv(options.env), defineEnv: options.defineEnv });
    }
    class ProjectImpl {
        constructor(nativeProject) {
            this._nativeProject = nativeProject;
        }
        async update(options) {
            await withErrorCause(async () => binding.projectUpdate(this._nativeProject, await rustifyProjectOptions(options)));
        }
        entrypointsSubscribe() {
            const subscription = subscribe(false, async (callback) => binding.projectEntrypointsSubscribe(this._nativeProject, callback));
            return (function () {
                return __asyncGenerator(this, arguments, function* () {
                    var _a, e_1, _b, _c;
                    try {
                        for (var _d = true, subscription_1 = __asyncValues(subscription), subscription_1_1; subscription_1_1 = yield __await(subscription_1.next()), _a = subscription_1_1.done, !_a; _d = true) {
                            _c = subscription_1_1.value;
                            _d = false;
                            const entrypoints = _c;
                            const routes = new Map();
                            for (let _e of entrypoints.routes) {
                                const { pathname } = _e, nativeRoute = __rest(_e, ["pathname"]);
                                let route;
                                const routeType = nativeRoute.type;
                                switch (routeType) {
                                    case 'page':
                                        route = {
                                            type: 'page',
                                            htmlEndpoint: new EndpointImpl(nativeRoute.htmlEndpoint),
                                            dataEndpoint: new EndpointImpl(nativeRoute.dataEndpoint),
                                        };
                                        break;
                                    case 'page-api':
                                        route = {
                                            type: 'page-api',
                                            endpoint: new EndpointImpl(nativeRoute.endpoint),
                                        };
                                        break;
                                    case 'app-page':
                                        route = {
                                            type: 'app-page',
                                            htmlEndpoint: new EndpointImpl(nativeRoute.htmlEndpoint),
                                            rscEndpoint: new EndpointImpl(nativeRoute.rscEndpoint),
                                        };
                                        break;
                                    case 'app-route':
                                        route = {
                                            type: 'app-route',
                                            endpoint: new EndpointImpl(nativeRoute.endpoint),
                                        };
                                        break;
                                    case 'conflict':
                                        route = {
                                            type: 'conflict',
                                        };
                                        break;
                                    default:
                                        const _exhaustiveCheck = routeType;
                                        invariant(nativeRoute, () => `Unknown route type: ${_exhaustiveCheck}`);
                                }
                                routes.set(pathname, route);
                            }
                            const napiMiddlewareToMiddleware = (middleware) => ({
                                endpoint: new EndpointImpl(middleware.endpoint),
                                runtime: middleware.runtime,
                                matcher: middleware.matcher,
                            });
                            const middleware = entrypoints.middleware
                                ? napiMiddlewareToMiddleware(entrypoints.middleware)
                                : undefined;
                            const napiInstrumentationToInstrumentation = (instrumentation) => ({
                                nodeJs: new EndpointImpl(instrumentation.nodeJs),
                                edge: new EndpointImpl(instrumentation.edge),
                            });
                            const instrumentation = entrypoints.instrumentation
                                ? napiInstrumentationToInstrumentation(entrypoints.instrumentation)
                                : undefined;
                            yield yield __await({
                                routes,
                                middleware,
                                instrumentation,
                                pagesDocumentEndpoint: new EndpointImpl(entrypoints.pagesDocumentEndpoint),
                                pagesAppEndpoint: new EndpointImpl(entrypoints.pagesAppEndpoint),
                                pagesErrorEndpoint: new EndpointImpl(entrypoints.pagesErrorEndpoint),
                                issues: entrypoints.issues,
                                diagnostics: entrypoints.diagnostics,
                            });
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_d && !_a && (_b = subscription_1.return)) yield __await(_b.call(subscription_1));
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                });
            })();
        }
        hmrEvents(identifier) {
            const subscription = subscribe(true, async (callback) => binding.projectHmrEvents(this._nativeProject, identifier, callback));
            return subscription;
        }
        hmrIdentifiersSubscribe() {
            const subscription = subscribe(false, async (callback) => binding.projectHmrIdentifiersSubscribe(this._nativeProject, callback));
            return subscription;
        }
        traceSource(stackFrame) {
            return binding.projectTraceSource(this._nativeProject, stackFrame);
        }
        getSourceForAsset(filePath) {
            return binding.projectGetSourceForAsset(this._nativeProject, filePath);
        }
        updateInfoSubscribe() {
            const subscription = subscribe(true, async (callback) => binding.projectUpdateInfoSubscribe(this._nativeProject, callback));
            return subscription;
        }
    }
    class EndpointImpl {
        constructor(nativeEndpoint) {
            this._nativeEndpoint = nativeEndpoint;
        }
        async writeToDisk() {
            return await withErrorCause(() => binding.endpointWriteToDisk(this._nativeEndpoint));
        }
        async clientChanged() {
            const clientSubscription = subscribe(false, async (callback) => binding.endpointClientChangedSubscribe(await this._nativeEndpoint, callback));
            await clientSubscription.next();
            return clientSubscription;
        }
        async serverChanged(includeIssues) {
            const serverSubscription = subscribe(false, async (callback) => binding.endpointServerChangedSubscribe(await this._nativeEndpoint, includeIssues, callback));
            await serverSubscription.next();
            return serverSubscription;
        }
    }
    async function serializeNextConfig(nextConfig, projectPath) {
        var _a, _b, _c, _d;
        let nextConfigSerializable = nextConfig;
        nextConfigSerializable.generateBuildId =
            await ((_a = nextConfig.generateBuildId) === null || _a === void 0 ? void 0 : _a.call(nextConfig));
        // TODO: these functions takes arguments, have to be supported in a different way
        nextConfigSerializable.exportPathMap = {};
        nextConfigSerializable.webpack = nextConfig.webpack && {};
        if ((_c = (_b = nextConfig.experimental) === null || _b === void 0 ? void 0 : _b.turbo) === null || _c === void 0 ? void 0 : _c.rules) {
            ensureLoadersHaveSerializableOptions((_d = nextConfig.experimental.turbo) === null || _d === void 0 ? void 0 : _d.rules);
        }
        nextConfigSerializable.modularizeImports =
            nextConfigSerializable.modularizeImports
                ? Object.fromEntries(Object.entries(nextConfigSerializable.modularizeImports).map(([mod, config]) => [
                    mod,
                    Object.assign(Object.assign({}, config), { transform: typeof config.transform === 'string'
                            ? config.transform
                            : Object.entries(config.transform).map(([key, value]) => [
                                key,
                                value,
                            ]) }),
                ]))
                : undefined;
        // loaderFile is an absolute path, we need it to be relative for turbopack.
        if (nextConfig.images.loaderFile) {
            nextConfig.images.loaderFile =
                './' + path.relative(projectPath, nextConfig.images.loaderFile);
        }
        return JSON.stringify(nextConfigSerializable, null, 2);
    }
    function ensureLoadersHaveSerializableOptions(turbopackRules) {
        for (const [glob, rule] of Object.entries(turbopackRules)) {
            const loaderItems = Array.isArray(rule) ? rule : rule.loaders;
            for (const loaderItem of loaderItems) {
                if (typeof loaderItem !== 'string' &&
                    !isDeepStrictEqual(loaderItem, JSON.parse(JSON.stringify(loaderItem)))) {
                    throw new Error(`loader ${loaderItem.loader} for match "${glob}" does not have serializable options. Ensure that options passed are plain JavaScript objects and values.`);
                }
            }
        }
    }
    async function createProject(options, turboEngineOptions) {
        return new ProjectImpl(await binding.projectNew(await rustifyProjectOptions(options), turboEngineOptions || {}));
    }
    return createProject;
}
async function loadWasm(importPath = '') {
    var _a;
    if (wasmBindings) {
        return wasmBindings;
    }
    let attempts = [];
    for (let pkg of ['@next/swc-wasm-nodejs', '@next/swc-wasm-web']) {
        try {
            let pkgPath = pkg;
            if (importPath) {
                // the import path must be exact when not in node_modules
                pkgPath = path.join(importPath, pkg, 'wasm.js');
            }
            let bindings = await import(pkgPath);
            if (pkg === '@next/swc-wasm-web') {
                bindings = await bindings.default();
            }
            infoLog('next-swc build: wasm build @next/swc-wasm-web');
            // Note wasm binary does not support async intefaces yet, all async
            // interface coereces to sync interfaces.
            wasmBindings = {
                isWasm: true,
                transform(src, options) {
                    // TODO: we can remove fallback to sync interface once new stable version of next-swc gets published (current v12.2)
                    return (bindings === null || bindings === void 0 ? void 0 : bindings.transform)
                        ? bindings.transform(src.toString(), options)
                        : Promise.resolve(bindings.transformSync(src.toString(), options));
                },
                transformSync(src, options) {
                    return bindings.transformSync(src.toString(), options);
                },
                minify(src, options) {
                    return (bindings === null || bindings === void 0 ? void 0 : bindings.minify)
                        ? bindings.minify(src.toString(), options)
                        : Promise.resolve(bindings.minifySync(src.toString(), options));
                },
                minifySync(src, options) {
                    return bindings.minifySync(src.toString(), options);
                },
                parse(src, options) {
                    return (bindings === null || bindings === void 0 ? void 0 : bindings.parse)
                        ? bindings.parse(src.toString(), options)
                        : Promise.resolve(bindings.parseSync(src.toString(), options));
                },
                parseSync(src, options) {
                    const astStr = bindings.parseSync(src.toString(), options);
                    return astStr;
                },
                getTargetTriple() {
                    return undefined;
                },
                turbo: {
                    startTrace: () => {
                        Log.error('Wasm binding does not support trace yet');
                    },
                    entrypoints: {
                        stream: (turboTasks, rootDir, applicationDir, pageExtensions, callbackFn) => {
                            return bindings.streamEntrypoints(turboTasks, rootDir, applicationDir, pageExtensions, callbackFn);
                        },
                        get: (turboTasks, rootDir, applicationDir, pageExtensions) => {
                            return bindings.getEntrypoints(turboTasks, rootDir, applicationDir, pageExtensions);
                        },
                    },
                },
                mdx: {
                    compile: (src, options) => bindings.mdxCompile(src, getMdxOptions(options)),
                    compileSync: (src, options) => bindings.mdxCompileSync(src, getMdxOptions(options)),
                },
            };
            return wasmBindings;
        }
        catch (e) {
            // Only log attempts for loading wasm when loading as fallback
            if (importPath) {
                if ((e === null || e === void 0 ? void 0 : e.code) === 'ERR_MODULE_NOT_FOUND') {
                    attempts.push(`Attempted to load ${pkg}, but it was not installed`);
                }
                else {
                    attempts.push(`Attempted to load ${pkg}, but an error occurred: ${(_a = e.message) !== null && _a !== void 0 ? _a : e}`);
                }
            }
        }
    }
    throw attempts;
}
function loadNative(importPath) {
    var _a, _b;
    if (nativeBindings) {
        return nativeBindings;
    }
    const customBindings = !!__INTERNAL_CUSTOM_TURBOPACK_BINDINGS
        ? require(__INTERNAL_CUSTOM_TURBOPACK_BINDINGS)
        : null;
    let bindings;
    let attempts = [];
    for (const triple of triples) {
        try {
            bindings = require(`@next/swc/native/next-swc.${triple.platformArchABI}.node`);
            infoLog('next-swc build: local built @next/swc');
            break;
        }
        catch (e) { }
    }
    if (!bindings) {
        for (const triple of triples) {
            let pkg = importPath
                ? path.join(importPath, `@next/swc-${triple.platformArchABI}`, `next-swc.${triple.platformArchABI}.node`)
                : `@next/swc-${triple.platformArchABI}`;
            try {
                bindings = require(pkg);
                if (!importPath) {
                    checkVersionMismatch(require(`${pkg}/package.json`));
                }
                break;
            }
            catch (e) {
                if ((e === null || e === void 0 ? void 0 : e.code) === 'MODULE_NOT_FOUND') {
                    attempts.push(`Attempted to load ${pkg}, but it was not installed`);
                }
                else {
                    attempts.push(`Attempted to load ${pkg}, but an error occurred: ${(_a = e.message) !== null && _a !== void 0 ? _a : e}`);
                }
                lastNativeBindingsLoadErrorCode = (_b = e === null || e === void 0 ? void 0 : e.code) !== null && _b !== void 0 ? _b : 'unknown';
            }
        }
    }
    if (bindings) {
        nativeBindings = {
            isWasm: false,
            transform(src, options) {
                var _a, _b;
                const isModule = typeof src !== undefined &&
                    typeof src !== 'string' &&
                    !Buffer.isBuffer(src);
                options = options || {};
                if ((_a = options === null || options === void 0 ? void 0 : options.jsc) === null || _a === void 0 ? void 0 : _a.parser) {
                    options.jsc.parser.syntax = (_b = options.jsc.parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';
                }
                return bindings.transform(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
            },
            transformSync(src, options) {
                var _a, _b;
                if (typeof src === undefined) {
                    throw new Error("transformSync doesn't implement reading the file from filesystem");
                }
                else if (Buffer.isBuffer(src)) {
                    throw new Error("transformSync doesn't implement taking the source code as Buffer");
                }
                const isModule = typeof src !== 'string';
                options = options || {};
                if ((_a = options === null || options === void 0 ? void 0 : options.jsc) === null || _a === void 0 ? void 0 : _a.parser) {
                    options.jsc.parser.syntax = (_b = options.jsc.parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';
                }
                return bindings.transformSync(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
            },
            minify(src, options) {
                return bindings.minify(toBuffer(src), toBuffer(options !== null && options !== void 0 ? options : {}));
            },
            minifySync(src, options) {
                return bindings.minifySync(toBuffer(src), toBuffer(options !== null && options !== void 0 ? options : {}));
            },
            parse(src, options) {
                return bindings.parse(src, toBuffer(options !== null && options !== void 0 ? options : {}));
            },
            getTargetTriple: bindings.getTargetTriple,
            initCustomTraceSubscriber: bindings.initCustomTraceSubscriber,
            teardownTraceSubscriber: bindings.teardownTraceSubscriber,
            initHeapProfiler: bindings.initHeapProfiler,
            teardownHeapProfiler: bindings.teardownHeapProfiler,
            turbo: {
                startTrace: (options = {}, turboTasks) => {
                    initHeapProfiler();
                    const ret = (customBindings !== null && customBindings !== void 0 ? customBindings : bindings).runTurboTracing(toBuffer(Object.assign({ exact: true }, options)), turboTasks);
                    return ret;
                },
                createTurboTasks: (memoryLimit) => bindings.createTurboTasks(memoryLimit),
                entrypoints: {
                    stream: (turboTasks, rootDir, applicationDir, pageExtensions, fn) => {
                        return (customBindings !== null && customBindings !== void 0 ? customBindings : bindings).streamEntrypoints(turboTasks, rootDir, applicationDir, pageExtensions, fn);
                    },
                    get: (turboTasks, rootDir, applicationDir, pageExtensions) => {
                        return (customBindings !== null && customBindings !== void 0 ? customBindings : bindings).getEntrypoints(turboTasks, rootDir, applicationDir, pageExtensions);
                    },
                },
                createProject: bindingToApi(customBindings !== null && customBindings !== void 0 ? customBindings : bindings, false),
            },
            mdx: {
                compile: (src, options) => bindings.mdxCompile(src, toBuffer(getMdxOptions(options))),
                compileSync: (src, options) => bindings.mdxCompileSync(src, toBuffer(getMdxOptions(options))),
            },
        };
        return nativeBindings;
    }
    throw attempts;
}
/// Build a mdx options object contains default values that
/// can be parsed with serde_wasm_bindgen.
function getMdxOptions(options = {}) {
    var _a, _b, _c;
    const ret = Object.assign(Object.assign({}, options), { development: (_a = options.development) !== null && _a !== void 0 ? _a : false, jsx: (_b = options.jsx) !== null && _b !== void 0 ? _b : false, parse: (_c = options.parse) !== null && _c !== void 0 ? _c : {
            gfmStrikethroughSingleTilde: true,
            mathTextSingleDollar: true,
        } });
    return ret;
}
function toBuffer(t) {
    return Buffer.from(JSON.stringify(t));
}
export async function isWasm() {
    let bindings = await loadBindings();
    return bindings.isWasm;
}
export async function transform(src, options) {
    let bindings = await loadBindings();
    return bindings.transform(src, options);
}
export function transformSync(src, options) {
    let bindings = loadBindingsSync();
    return bindings.transformSync(src, options);
}
export async function minify(src, options) {
    let bindings = await loadBindings();
    return bindings.minify(src, options);
}
export function minifySync(src, options) {
    let bindings = loadBindingsSync();
    return bindings.minifySync(src, options);
}
export async function parse(src, options) {
    let bindings = await loadBindings();
    let parserOptions = getParserOptions(options);
    return bindings
        .parse(src, parserOptions)
        .then((astStr) => JSON.parse(astStr));
}
export function getBinaryMetadata() {
    var _a;
    let bindings;
    try {
        bindings = loadNative();
    }
    catch (e) {
        // Suppress exceptions, this fn allows to fail to load native bindings
    }
    return {
        target: (_a = bindings === null || bindings === void 0 ? void 0 : bindings.getTargetTriple) === null || _a === void 0 ? void 0 : _a.call(bindings),
    };
}
/**
 * Initialize trace subscriber to emit traces.
 *
 */
export const initCustomTraceSubscriber = (traceFileName) => {
    if (!swcTraceFlushGuard) {
        // Wasm binary doesn't support trace emission
        let bindings = loadNative();
        swcTraceFlushGuard = bindings.initCustomTraceSubscriber(traceFileName);
    }
};
/**
 * Initialize heap profiler, if possible.
 * Note this is not available in release build of next-swc by default,
 * only available by manually building next-swc with specific flags.
 * Calling in release build will not do anything.
 */
export const initHeapProfiler = () => {
    try {
        if (!swcHeapProfilerFlushGuard) {
            let bindings = loadNative();
            swcHeapProfilerFlushGuard = bindings.initHeapProfiler();
        }
    }
    catch (_) {
        // Suppress exceptions, this fn allows to fail to load native bindings
    }
};
/**
 * Teardown heap profiler, if possible.
 *
 * Same as initialization, this is not available in release build of next-swc by default
 * and calling it will not do anything.
 */
export const teardownHeapProfiler = (() => {
    let flushed = false;
    return () => {
        if (!flushed) {
            flushed = true;
            try {
                let bindings = loadNative();
                if (swcHeapProfilerFlushGuard) {
                    bindings.teardownHeapProfiler(swcHeapProfilerFlushGuard);
                }
            }
            catch (e) {
                // Suppress exceptions, this fn allows to fail to load native bindings
            }
        }
    };
})();
/**
 * Teardown swc's trace subscriber if there's an initialized flush guard exists.
 *
 * This is workaround to amend behavior with process.exit
 * (https://github.com/vercel/next.js/blob/4db8c49cc31e4fc182391fae6903fb5ef4e8c66e/packages/next/bin/next.ts#L134=)
 * seems preventing napi's cleanup hook execution (https://github.com/swc-project/swc/blob/main/crates/node/src/util.rs#L48-L51=),
 *
 * instead parent process manually drops guard when process gets signal to exit.
 */
export const teardownTraceSubscriber = (() => {
    let flushed = false;
    return () => {
        if (!flushed) {
            flushed = true;
            try {
                let bindings = loadNative();
                if (swcTraceFlushGuard) {
                    bindings.teardownTraceSubscriber(swcTraceFlushGuard);
                }
            }
            catch (e) {
                // Suppress exceptions, this fn allows to fail to load native bindings
            }
        }
    };
})();