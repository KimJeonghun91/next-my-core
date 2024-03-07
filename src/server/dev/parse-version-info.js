import * as semver from 'next/dist/compiled/semver';
export function parseVersionInfo(o) {
    var _a;
    const latest = semver.parse(o.latest);
    const canary = semver.parse(o.canary);
    const installedParsed = semver.parse(o.installed);
    const installed = o.installed;
    if (installedParsed && latest && canary) {
        if (installedParsed.major < latest.major) {
            // Old major version
            return { staleness: 'stale-major', expected: latest.raw, installed };
        }
        else if (installedParsed.prerelease[0] === 'canary' &&
            semver.lt(installedParsed, canary)) {
            // Matching major, but old canary
            return {
                staleness: 'stale-prerelease',
                expected: canary.raw,
                installed,
            };
        }
        else if (!installedParsed.prerelease.length &&
            semver.lt(installedParsed, latest)) {
            // Stable, but not the latest
            if (installedParsed.minor === latest.minor) {
                // Same major and minor, but not the latest patch
                return {
                    staleness: 'stale-patch',
                    expected: latest.raw,
                    installed,
                };
            }
            return { staleness: 'stale-minor', expected: latest.raw, installed };
        }
        else if (semver.gt(installedParsed, latest) &&
            installedParsed.version !== canary.version) {
            // Newer major version
            return { staleness: 'newer-than-npm', installed };
        }
        else {
            // Latest and greatest
            return { staleness: 'fresh', installed };
        }
    }
    return {
        installed: (_a = installedParsed === null || installedParsed === void 0 ? void 0 : installedParsed.raw) !== null && _a !== void 0 ? _a : '0.0.0',
        staleness: 'unknown',
    };
}
