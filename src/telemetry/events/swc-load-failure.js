import { traceGlobals } from '../../trace/shared';
// @ts-ignore JSON
import { version as nextVersion, optionalDependencies } from 'next/package.json';
const EVENT_PLUGIN_PRESENT = 'NEXT_SWC_LOAD_FAILURE';
export async function eventSwcLoadFailure(event) {
    var _a;
    const telemetry = traceGlobals.get('telemetry');
    // can't continue if telemetry isn't set
    if (!telemetry)
        return;
    let glibcVersion;
    let installedSwcPackages;
    try {
        // @ts-ignore
        glibcVersion = (_a = process.report) === null || _a === void 0 ? void 0 : _a.getReport().header.glibcVersionRuntime;
    }
    catch (_b) { }
    try {
        const pkgNames = Object.keys(optionalDependencies || {}).filter((pkg) => pkg.startsWith('@next/swc'));
        const installedPkgs = [];
        for (const pkg of pkgNames) {
            try {
                const { version } = require(`${pkg}/package.json`);
                installedPkgs.push(`${pkg}@${version}`);
            }
            catch (_c) { }
        }
        if (installedPkgs.length > 0) {
            installedSwcPackages = installedPkgs.sort().join(',');
        }
    }
    catch (_d) { }
    telemetry.record({
        eventName: EVENT_PLUGIN_PRESENT,
        payload: {
            nextVersion,
            glibcVersion,
            installedSwcPackages,
            arch: process.arch,
            platform: process.platform,
            nodeVersion: process.versions.node,
            wasm: event === null || event === void 0 ? void 0 : event.wasm,
            nativeBindingsErrorCode: event === null || event === void 0 ? void 0 : event.nativeBindingsErrorCode,
        },
    });
    // ensure this event is flushed before process exits
    await telemetry.flush();
}
