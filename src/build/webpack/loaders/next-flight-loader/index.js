import { RSC_MOD_REF_PROXY_ALIAS } from '../../../../lib/constants';
import { BARREL_OPTIMIZATION_PREFIX, RSC_MODULE_TYPES, } from '../../../../shared/lib/constants';
import { warnOnce } from '../../../../shared/lib/utils/warn-once';
import { getRSCModuleInformation } from '../../../analysis/get-page-static-info';
import { formatBarrelOptimizedResource } from '../../utils';
import { getModuleBuildInfo } from '../get-module-build-info';
const noopHeadPath = require.resolve('next/dist/client/components/noop-head');
// For edge runtime it will be aliased to esm version by webpack
const MODULE_PROXY_PATH = 'next/dist/build/webpack/loaders/next-flight-loader/module-proxy';
export default function transformSource(source, sourceMap) {
    var _a, _b, _c, _d, _e, _f;
    // Avoid buffer to be consumed
    if (typeof source !== 'string') {
        throw new Error('Expected source to have been transformed to a string.');
    }
    // Assign the RSC meta information to buildInfo.
    // Exclude next internal files which are not marked as client files
    const buildInfo = getModuleBuildInfo(this._module);
    buildInfo.rsc = getRSCModuleInformation(source, true);
    // Resource key is the unique identifier for the resource. When RSC renders
    // a client module, that key is used to identify that module across all compiler
    // layers.
    //
    // Usually it's the module's file path + the export name (e.g. `foo.js#bar`).
    // But with Barrel Optimizations, one file can be splitted into multiple modules,
    // so when you import `foo.js#bar` and `foo.js#baz`, they are actually different
    // "foo.js" being created by the Barrel Loader (one only exports `bar`, the other
    // only exports `baz`).
    //
    // Because of that, we must add another query param to the resource key to
    // differentiate them.
    let resourceKey = this.resourcePath;
    if ((_b = (_a = this._module) === null || _a === void 0 ? void 0 : _a.matchResource) === null || _b === void 0 ? void 0 : _b.startsWith(BARREL_OPTIMIZATION_PREFIX)) {
        resourceKey = formatBarrelOptimizedResource(resourceKey, this._module.matchResource);
    }
    // A client boundary.
    if (((_c = buildInfo.rsc) === null || _c === void 0 ? void 0 : _c.type) === RSC_MODULE_TYPES.client) {
        const sourceType = (_e = (_d = this._module) === null || _d === void 0 ? void 0 : _d.parser) === null || _e === void 0 ? void 0 : _e.sourceType;
        const detectedClientEntryType = buildInfo.rsc.clientEntryType;
        const clientRefs = buildInfo.rsc.clientRefs;
        // It's tricky to detect the type of a client boundary, but we should always
        // use the `module` type when we can, to support `export *` and `export from`
        // syntax in other modules that import this client boundary.
        let assumedSourceType = sourceType;
        if (assumedSourceType === 'auto' && detectedClientEntryType === 'auto') {
            if (clientRefs.length === 0 ||
                (clientRefs.length === 1 && clientRefs[0] === '')) {
                // If there's zero export detected in the client boundary, and it's the
                // `auto` type, we can safely assume it's a CJS module because it doesn't
                // have ESM exports.
                assumedSourceType = 'commonjs';
            }
            else if (!clientRefs.includes('*')) {
                // Otherwise, we assume it's an ESM module.
                assumedSourceType = 'module';
            }
        }
        if (assumedSourceType === 'module') {
            if (clientRefs.includes('*')) {
                this.callback(new Error(`It's currently unsupported to use "export *" in a client boundary. Please use named exports instead.`));
                return;
            }
            let esmSource = `\
import { createProxy } from "${MODULE_PROXY_PATH}"
const proxy = createProxy(String.raw\`${resourceKey}\`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule, $$typeof } = proxy;
const __default__ = proxy.default;
`;
            let cnt = 0;
            for (const ref of clientRefs) {
                if (ref === '') {
                    esmSource += `\nexports[''] = createProxy(String.raw\`${resourceKey}#\`);`;
                }
                else if (ref === 'default') {
                    esmSource += `
export { __esModule, $$typeof };
export default __default__;`;
                }
                else {
                    esmSource += `
const e${cnt} = createProxy(String.raw\`${resourceKey}#${ref}\`);
export { e${cnt++} as ${ref} };`;
                }
            }
            this.callback(null, esmSource, sourceMap);
            return;
        }
    }
    if (((_f = buildInfo.rsc) === null || _f === void 0 ? void 0 : _f.type) !== RSC_MODULE_TYPES.client) {
        if (noopHeadPath === this.resourcePath) {
            warnOnce(`Warning: You're using \`next/head\` inside the \`app\` directory, please migrate to the Metadata API. See https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration#step-3-migrating-nexthead for more details.`);
        }
    }
    this.callback(null, source.replace(RSC_MOD_REF_PROXY_ALIAS, MODULE_PROXY_PATH), sourceMap);
}