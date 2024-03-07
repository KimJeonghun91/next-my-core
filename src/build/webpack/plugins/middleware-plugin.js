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
import { getNamedMiddlewareRegex } from '../../../shared/lib/router/utils/route-regex';
import { getModuleBuildInfo } from '../loaders/get-module-build-info';
import { getSortedRoutes } from '../../../shared/lib/router/utils';
import { webpack, sources } from 'next/dist/compiled/webpack/webpack';
import { isMatch } from 'next/dist/compiled/micromatch';
import path from 'path';
import { EDGE_RUNTIME_WEBPACK, EDGE_UNSUPPORTED_NODE_APIS, MIDDLEWARE_BUILD_MANIFEST, CLIENT_REFERENCE_MANIFEST, MIDDLEWARE_MANIFEST, MIDDLEWARE_REACT_LOADABLE_MANIFEST, SUBRESOURCE_INTEGRITY_MANIFEST, NEXT_FONT_MANIFEST, SERVER_REFERENCE_MANIFEST, PRERENDER_MANIFEST, } from '../../../shared/lib/constants';
import { traceGlobals } from '../../../trace/shared';
import { EVENT_BUILD_FEATURE_USAGE } from '../../../telemetry/events';
import { normalizeAppPath } from '../../../shared/lib/router/utils/app-paths';
import { INSTRUMENTATION_HOOK_FILENAME } from '../../../lib/constants';
const KNOWN_SAFE_DYNAMIC_PACKAGES = require('../../../lib/known-edge-safe-packages.json');
const NAME = 'MiddlewarePlugin';
/**
 * Checks the value of usingIndirectEval and when it is a set of modules it
 * check if any of the modules is actually being used. If the value is
 * simply truthy it will return true.
 */
function isUsingIndirectEvalAndUsedByExports(args) {
    const { moduleGraph, runtime, module, usingIndirectEval, wp } = args;
    if (typeof usingIndirectEval === 'boolean') {
        return usingIndirectEval;
    }
    const exportsInfo = moduleGraph.getExportsInfo(module);
    for (const exportName of usingIndirectEval) {
        if (exportsInfo.getUsed(exportName, runtime) !== wp.UsageState.Unused) {
            return true;
        }
    }
    return false;
}
function getEntryFiles(entryFiles, meta, hasInstrumentationHook, opts) {
    const files = [];
    if (meta.edgeSSR) {
        if (meta.edgeSSR.isServerComponent) {
            files.push(`server/${SERVER_REFERENCE_MANIFEST}.js`);
            if (opts.sriEnabled) {
                files.push(`server/${SUBRESOURCE_INTEGRITY_MANIFEST}.js`);
            }
            files.push(...entryFiles
                .filter((file) => file.startsWith('app/') && !file.endsWith('.hot-update.js'))
                .map((file) => 'server/' +
                file.replace('.js', '_' + CLIENT_REFERENCE_MANIFEST + '.js')));
        }
        files.push(`server/${MIDDLEWARE_BUILD_MANIFEST}.js`, `server/${MIDDLEWARE_REACT_LOADABLE_MANIFEST}.js`);
        files.push(`server/${NEXT_FONT_MANIFEST}.js`);
    }
    if (hasInstrumentationHook) {
        files.push(`server/edge-${INSTRUMENTATION_HOOK_FILENAME}.js`);
    }
    if (process.env.NODE_ENV === 'production') {
        files.push(PRERENDER_MANIFEST.replace('json', 'js'));
    }
    files.push(...entryFiles
        .filter((file) => !file.endsWith('.hot-update.js'))
        .map((file) => 'server/' + file));
    return files;
}
function getCreateAssets(params) {
    const { compilation, metadataByEntry, opts } = params;
    return (assets) => {
        var _a, _b, _c, _d, _e, _f;
        const middlewareManifest = {
            sortedMiddleware: [],
            middleware: {},
            functions: {},
            version: 2,
        };
        const hasInstrumentationHook = compilation.entrypoints.has(INSTRUMENTATION_HOOK_FILENAME);
        for (const entrypoint of compilation.entrypoints.values()) {
            if (!entrypoint.name) {
                continue;
            }
            // There should always be metadata for the entrypoint.
            const metadata = metadataByEntry.get(entrypoint.name);
            const page = ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.edgeMiddleware) === null || _a === void 0 ? void 0 : _a.page) ||
                ((_b = metadata === null || metadata === void 0 ? void 0 : metadata.edgeSSR) === null || _b === void 0 ? void 0 : _b.page) ||
                ((_c = metadata === null || metadata === void 0 ? void 0 : metadata.edgeApiFunction) === null || _c === void 0 ? void 0 : _c.page);
            if (!page) {
                continue;
            }
            const matcherSource = ((_d = metadata.edgeSSR) === null || _d === void 0 ? void 0 : _d.isAppDir)
                ? normalizeAppPath(page)
                : page;
            const catchAll = !metadata.edgeSSR && !metadata.edgeApiFunction;
            const { namedRegex } = getNamedMiddlewareRegex(matcherSource, {
                catchAll,
            });
            const matchers = (_f = (_e = metadata === null || metadata === void 0 ? void 0 : metadata.edgeMiddleware) === null || _e === void 0 ? void 0 : _e.matchers) !== null && _f !== void 0 ? _f : [
                {
                    regexp: namedRegex,
                    originalSource: page === '/' && catchAll ? '/:path*' : matcherSource,
                },
            ];
            const edgeFunctionDefinition = Object.assign({ files: getEntryFiles(entrypoint.getFiles(), metadata, hasInstrumentationHook, opts), name: entrypoint.name, page: page, matchers, wasm: Array.from(metadata.wasmBindings, ([name, filePath]) => ({
                    name,
                    filePath,
                })), assets: Array.from(metadata.assetBindings, ([name, filePath]) => ({
                    name,
                    filePath,
                })) }, (metadata.regions && { regions: metadata.regions }));
            if (metadata.edgeApiFunction || metadata.edgeSSR) {
                middlewareManifest.functions[page] = edgeFunctionDefinition;
            }
            else {
                middlewareManifest.middleware[page] = edgeFunctionDefinition;
            }
        }
        middlewareManifest.sortedMiddleware = getSortedRoutes(Object.keys(middlewareManifest.middleware));
        assets[MIDDLEWARE_MANIFEST] = new sources.RawSource(JSON.stringify(middlewareManifest, null, 2));
    };
}
function buildWebpackError({ message, loc, compilation, entryModule, parser, }) {
    const error = new compilation.compiler.webpack.WebpackError(message);
    error.name = NAME;
    const module = entryModule !== null && entryModule !== void 0 ? entryModule : parser === null || parser === void 0 ? void 0 : parser.state.current;
    if (module) {
        error.module = module;
    }
    error.loc = loc;
    return error;
}
function isInMiddlewareLayer(parser) {
    var _a;
    return ((_a = parser.state.module) === null || _a === void 0 ? void 0 : _a.layer) === 'middleware';
}
function isNodeJsModule(moduleName) {
    return require('module').builtinModules.includes(moduleName);
}
function isDynamicCodeEvaluationAllowed(fileName, middlewareConfig, rootDir) {
    var _a;
    // Some packages are known to use `eval` but are safe to use in the Edge
    // Runtime because the dynamic code will never be executed.
    if (KNOWN_SAFE_DYNAMIC_PACKAGES.some((pkg) => fileName.includes(`/node_modules/${pkg}/`.replace(/\//g, path.sep)))) {
        return true;
    }
    const name = fileName.replace(rootDir !== null && rootDir !== void 0 ? rootDir : '', '');
    return isMatch(name, (_a = middlewareConfig === null || middlewareConfig === void 0 ? void 0 : middlewareConfig.unstable_allowDynamicGlobs) !== null && _a !== void 0 ? _a : []);
}
function buildUnsupportedApiError(_a) {
    var { apiName, loc } = _a, rest = __rest(_a, ["apiName", "loc"]);
    return buildWebpackError(Object.assign({ message: `A Node.js API is used (${apiName} at line: ${loc.start.line}) which is not supported in the Edge Runtime.
Learn more: https://nextjs.org/docs/api-reference/edge-runtime`, loc }, rest));
}
function registerUnsupportedApiHooks(parser, compilation) {
    for (const expression of EDGE_UNSUPPORTED_NODE_APIS) {
        const warnForUnsupportedApi = (node) => {
            if (!isInMiddlewareLayer(parser)) {
                return;
            }
            compilation.warnings.push(buildUnsupportedApiError(Object.assign({ compilation,
                parser, apiName: expression }, node)));
            return true;
        };
        parser.hooks.call.for(expression).tap(NAME, warnForUnsupportedApi);
        parser.hooks.expression.for(expression).tap(NAME, warnForUnsupportedApi);
        parser.hooks.callMemberChain
            .for(expression)
            .tap(NAME, warnForUnsupportedApi);
        parser.hooks.expressionMemberChain
            .for(expression)
            .tap(NAME, warnForUnsupportedApi);
    }
    const warnForUnsupportedProcessApi = (node, [callee]) => {
        if (!isInMiddlewareLayer(parser) || callee === 'env') {
            return;
        }
        compilation.warnings.push(buildUnsupportedApiError(Object.assign({ compilation,
            parser, apiName: `process.${callee}` }, node)));
        return true;
    };
    parser.hooks.callMemberChain
        .for('process')
        .tap(NAME, warnForUnsupportedProcessApi);
    parser.hooks.expressionMemberChain
        .for('process')
        .tap(NAME, warnForUnsupportedProcessApi);
}
function getCodeAnalyzer(params) {
    return (parser) => {
        const { dev, compiler: { webpack: wp }, compilation, } = params;
        const { hooks } = parser;
        /**
         * For an expression this will check the graph to ensure it is being used
         * by exports. Then it will store in the module buildInfo a boolean to
         * express that it contains dynamic code and, if it is available, the
         * module path that is using it.
         */
        const handleExpression = () => {
            if (!isInMiddlewareLayer(parser)) {
                return;
            }
            wp.optimize.InnerGraph.onUsage(parser.state, (used = true) => {
                const buildInfo = getModuleBuildInfo(parser.state.module);
                if (buildInfo.usingIndirectEval === true || used === false) {
                    return;
                }
                if (!buildInfo.usingIndirectEval || used === true) {
                    buildInfo.usingIndirectEval = used;
                    return;
                }
                buildInfo.usingIndirectEval = new Set([
                    ...Array.from(buildInfo.usingIndirectEval),
                    ...Array.from(used),
                ]);
            });
        };
        /**
         * This expression handler allows to wrap a dynamic code expression with a
         * function call where we can warn about dynamic code not being allowed
         * but actually execute the expression.
         */
        const handleWrapExpression = (expr) => {
            if (!isInMiddlewareLayer(parser)) {
                return;
            }
            const { ConstDependency } = wp.dependencies;
            const dep1 = new ConstDependency('__next_eval__(function() { return ', expr.range[0]);
            dep1.loc = expr.loc;
            parser.state.module.addPresentationalDependency(dep1);
            const dep2 = new ConstDependency('})', expr.range[1]);
            dep2.loc = expr.loc;
            parser.state.module.addPresentationalDependency(dep2);
            handleExpression();
            return true;
        };
        /**
         * This expression handler allows to wrap a WebAssembly.compile invocation with a
         * function call where we can warn about WASM code generation not being allowed
         * but actually execute the expression.
         */
        const handleWrapWasmCompileExpression = (expr) => {
            if (!isInMiddlewareLayer(parser)) {
                return;
            }
            const { ConstDependency } = wp.dependencies;
            const dep1 = new ConstDependency('__next_webassembly_compile__(function() { return ', expr.range[0]);
            dep1.loc = expr.loc;
            parser.state.module.addPresentationalDependency(dep1);
            const dep2 = new ConstDependency('})', expr.range[1]);
            dep2.loc = expr.loc;
            parser.state.module.addPresentationalDependency(dep2);
            handleExpression();
        };
        /**
         * This expression handler allows to wrap a WebAssembly.instatiate invocation with a
         * function call where we can warn about WASM code generation not being allowed
         * but actually execute the expression.
         *
         * Note that we don't update `usingIndirectEval`, i.e. we don't abort a production build
         * since we can't determine statically if the first parameter is a module (legit use) or
         * a buffer (dynamic code generation).
         */
        const handleWrapWasmInstantiateExpression = (expr) => {
            if (!isInMiddlewareLayer(parser)) {
                return;
            }
            if (dev) {
                const { ConstDependency } = wp.dependencies;
                const dep1 = new ConstDependency('__next_webassembly_instantiate__(function() { return ', expr.range[0]);
                dep1.loc = expr.loc;
                parser.state.module.addPresentationalDependency(dep1);
                const dep2 = new ConstDependency('})', expr.range[1]);
                dep2.loc = expr.loc;
                parser.state.module.addPresentationalDependency(dep2);
            }
        };
        /**
         * Handler to store original source location of static and dynamic imports into module's buildInfo.
         */
        const handleImport = (node) => {
            var _a, _b;
            if (isInMiddlewareLayer(parser) && ((_a = node.source) === null || _a === void 0 ? void 0 : _a.value) && (node === null || node === void 0 ? void 0 : node.loc)) {
                const { module, source } = parser.state;
                const buildInfo = getModuleBuildInfo(module);
                if (!buildInfo.importLocByPath) {
                    buildInfo.importLocByPath = new Map();
                }
                const importedModule = (_b = node.source.value) === null || _b === void 0 ? void 0 : _b.toString();
                buildInfo.importLocByPath.set(importedModule, {
                    sourcePosition: Object.assign(Object.assign({}, node.loc.start), { source: module.identifier() }),
                    sourceContent: source.toString(),
                });
                if (!dev && isNodeJsModule(importedModule)) {
                    compilation.warnings.push(buildWebpackError(Object.assign({ message: `A Node.js module is loaded ('${importedModule}' at line ${node.loc.start.line}) which is not supported in the Edge Runtime.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`, compilation,
                        parser }, node)));
                }
            }
        };
        /**
         * A noop handler to skip analyzing some cases.
         * Order matters: for it to work, it must be registered first
         */
        const skip = () => (isInMiddlewareLayer(parser) ? true : undefined);
        for (const prefix of ['', 'global.']) {
            hooks.expression.for(`${prefix}Function.prototype`).tap(NAME, skip);
            hooks.expression.for(`${prefix}Function.bind`).tap(NAME, skip);
            hooks.call.for(`${prefix}eval`).tap(NAME, handleWrapExpression);
            hooks.call.for(`${prefix}Function`).tap(NAME, handleWrapExpression);
            hooks.new.for(`${prefix}Function`).tap(NAME, handleWrapExpression);
            hooks.call
                .for(`${prefix}WebAssembly.compile`)
                .tap(NAME, handleWrapWasmCompileExpression);
            hooks.call
                .for(`${prefix}WebAssembly.instantiate`)
                .tap(NAME, handleWrapWasmInstantiateExpression);
        }
        hooks.importCall.tap(NAME, handleImport);
        hooks.import.tap(NAME, handleImport);
        if (!dev) {
            // do not issue compilation warning on dev: invoking code will provide details
            registerUnsupportedApiHooks(parser, compilation);
        }
    };
}
function getExtractMetadata(params) {
    const { dev, compilation, metadataByEntry, compiler } = params;
    const { webpack: wp } = compiler;
    return async () => {
        var _a, _b, _c;
        metadataByEntry.clear();
        const telemetry = traceGlobals.get('telemetry');
        for (const [entryName, entry] of compilation.entries) {
            if (entry.options.runtime !== EDGE_RUNTIME_WEBPACK) {
                // Only process edge runtime entries
                continue;
            }
            const entryDependency = (_a = entry.dependencies) === null || _a === void 0 ? void 0 : _a[0];
            const { rootDir, route } = getModuleBuildInfo(compilation.moduleGraph.getResolvedModule(entryDependency));
            const { moduleGraph } = compilation;
            const modules = new Set();
            const addEntriesFromDependency = (dependency) => {
                const module = moduleGraph.getModule(dependency);
                if (module) {
                    modules.add(module);
                }
            };
            entry.dependencies.forEach(addEntriesFromDependency);
            entry.includeDependencies.forEach(addEntriesFromDependency);
            const entryMetadata = {
                wasmBindings: new Map(),
                assetBindings: new Map(),
            };
            if ((_b = route === null || route === void 0 ? void 0 : route.middlewareConfig) === null || _b === void 0 ? void 0 : _b.regions) {
                entryMetadata.regions = route.middlewareConfig.regions;
            }
            if (route === null || route === void 0 ? void 0 : route.preferredRegion) {
                const preferredRegion = route.preferredRegion;
                entryMetadata.regions =
                    // Ensures preferredRegion is always an array in the manifest.
                    typeof preferredRegion === 'string'
                        ? [preferredRegion]
                        : preferredRegion;
            }
            let ogImageGenerationCount = 0;
            for (const module of modules) {
                const buildInfo = getModuleBuildInfo(module);
                /**
                 * Check if it uses the image generation feature.
                 */
                if (!dev) {
                    const resource = module.resource;
                    const hasOGImageGeneration = resource &&
                        /[\\/]node_modules[\\/]@vercel[\\/]og[\\/]dist[\\/]index\.(edge|node)\.js$|[\\/]next[\\/]dist[\\/](esm[\\/])?server[\\/]og[\\/]image-response\.js$/.test(resource);
                    if (hasOGImageGeneration) {
                        ogImageGenerationCount++;
                    }
                }
                /**
                 * When building for production checks if the module is using `eval`
                 * and in such case produces a compilation error. The module has to
                 * be in use.
                 */
                if (!dev &&
                    buildInfo.usingIndirectEval &&
                    isUsingIndirectEvalAndUsedByExports({
                        module,
                        moduleGraph,
                        runtime: wp.util.runtime.getEntryRuntime(compilation, entryName),
                        usingIndirectEval: buildInfo.usingIndirectEval,
                        wp,
                    })) {
                    const id = module.identifier();
                    if (/node_modules[\\/]regenerator-runtime[\\/]runtime\.js/.test(id)) {
                        continue;
                    }
                    if ((_c = route === null || route === void 0 ? void 0 : route.middlewareConfig) === null || _c === void 0 ? void 0 : _c.unstable_allowDynamicGlobs) {
                        telemetry === null || telemetry === void 0 ? void 0 : telemetry.record({
                            eventName: 'NEXT_EDGE_ALLOW_DYNAMIC_USED',
                            payload: {
                                file: route === null || route === void 0 ? void 0 : route.absolutePagePath.replace(rootDir !== null && rootDir !== void 0 ? rootDir : '', ''),
                                config: route === null || route === void 0 ? void 0 : route.middlewareConfig,
                                fileWithDynamicCode: module.userRequest.replace(rootDir !== null && rootDir !== void 0 ? rootDir : '', ''),
                            },
                        });
                    }
                    if (!isDynamicCodeEvaluationAllowed(module.userRequest, route === null || route === void 0 ? void 0 : route.middlewareConfig, rootDir)) {
                        compilation.errors.push(buildWebpackError({
                            message: `Dynamic Code Evaluation (e. g. 'eval', 'new Function', 'WebAssembly.compile') not allowed in Edge Runtime ${typeof buildInfo.usingIndirectEval !== 'boolean'
                                ? `\nUsed by ${Array.from(buildInfo.usingIndirectEval).join(', ')}`
                                : ''}\nLearn More: https://nextjs.org/docs/messages/edge-dynamic-code-evaluation`,
                            entryModule: module,
                            compilation,
                        }));
                    }
                }
                /**
                 * The entry module has to be either a page or a middleware and hold
                 * the corresponding metadata.
                 */
                if (buildInfo === null || buildInfo === void 0 ? void 0 : buildInfo.nextEdgeSSR) {
                    entryMetadata.edgeSSR = buildInfo.nextEdgeSSR;
                }
                else if (buildInfo === null || buildInfo === void 0 ? void 0 : buildInfo.nextEdgeMiddleware) {
                    entryMetadata.edgeMiddleware = buildInfo.nextEdgeMiddleware;
                }
                else if (buildInfo === null || buildInfo === void 0 ? void 0 : buildInfo.nextEdgeApiFunction) {
                    entryMetadata.edgeApiFunction = buildInfo.nextEdgeApiFunction;
                }
                /**
                 * If the module is a WASM module we read the binding information and
                 * append it to the entry wasm bindings.
                 */
                if (buildInfo === null || buildInfo === void 0 ? void 0 : buildInfo.nextWasmMiddlewareBinding) {
                    entryMetadata.wasmBindings.set(buildInfo.nextWasmMiddlewareBinding.name, buildInfo.nextWasmMiddlewareBinding.filePath);
                }
                if (buildInfo === null || buildInfo === void 0 ? void 0 : buildInfo.nextAssetMiddlewareBinding) {
                    entryMetadata.assetBindings.set(buildInfo.nextAssetMiddlewareBinding.name, buildInfo.nextAssetMiddlewareBinding.filePath);
                }
                /**
                 * Append to the list of modules to process outgoingConnections from
                 * the module that is being processed.
                 */
                for (const conn of moduleGraph.getOutgoingConnections(module)) {
                    if (conn.module) {
                        modules.add(conn.module);
                    }
                }
            }
            telemetry === null || telemetry === void 0 ? void 0 : telemetry.record({
                eventName: EVENT_BUILD_FEATURE_USAGE,
                payload: {
                    featureName: 'vercelImageGeneration',
                    invocationCount: ogImageGenerationCount,
                },
            });
            metadataByEntry.set(entryName, entryMetadata);
        }
    };
}
export default class MiddlewarePlugin {
    constructor({ dev, sriEnabled }) {
        this.dev = dev;
        this.sriEnabled = sriEnabled;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(NAME, (compilation, params) => {
            const { hooks } = params.normalModuleFactory;
            /**
             * This is the static code analysis phase.
             */
            const codeAnalyzer = getCodeAnalyzer({
                dev: this.dev,
                compiler,
                compilation,
            });
            hooks.parser.for('javascript/auto').tap(NAME, codeAnalyzer);
            hooks.parser.for('javascript/dynamic').tap(NAME, codeAnalyzer);
            hooks.parser.for('javascript/esm').tap(NAME, codeAnalyzer);
            /**
             * Extract all metadata for the entry points in a Map object.
             */
            const metadataByEntry = new Map();
            compilation.hooks.finishModules.tapPromise(NAME, getExtractMetadata({
                compilation,
                compiler,
                dev: this.dev,
                metadataByEntry,
            }));
            /**
             * Emit the middleware manifest.
             */
            compilation.hooks.processAssets.tap({
                name: 'NextJsMiddlewareManifest',
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
            }, getCreateAssets({
                compilation,
                metadataByEntry,
                opts: {
                    sriEnabled: this.sriEnabled,
                },
            }));
        });
    }
}
export const SUPPORTED_NATIVE_MODULES = [
    'buffer',
    'events',
    'assert',
    'util',
    'async_hooks',
];
const supportedEdgePolyfills = new Set(SUPPORTED_NATIVE_MODULES);
export function getEdgePolyfilledModules() {
    const records = {};
    for (const mod of SUPPORTED_NATIVE_MODULES) {
        records[mod] = `commonjs node:${mod}`;
        records[`node:${mod}`] = `commonjs node:${mod}`;
    }
    return records;
}
export async function handleWebpackExternalForEdgeRuntime({ request, context, contextInfo, getResolve, }) {
    if (contextInfo.issuerLayer === 'middleware' &&
        isNodeJsModule(request) &&
        !supportedEdgePolyfills.has(request)) {
        // allows user to provide and use their polyfills, as we do with buffer.
        try {
            await getResolve()(context, request);
        }
        catch (_a) {
            return `root  globalThis.__import_unsupported('${request}')`;
        }
    }
}
