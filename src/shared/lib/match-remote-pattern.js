import { makeRe } from 'next/dist/compiled/micromatch';
export function matchRemotePattern(pattern, url) {
    var _a;
    if (pattern.protocol !== undefined) {
        const actualProto = url.protocol.slice(0, -1);
        if (pattern.protocol !== actualProto) {
            return false;
        }
    }
    if (pattern.port !== undefined) {
        if (pattern.port !== url.port) {
            return false;
        }
    }
    if (pattern.hostname === undefined) {
        throw new Error(`Pattern should define hostname but found\n${JSON.stringify(pattern)}`);
    }
    else {
        if (!makeRe(pattern.hostname).test(url.hostname)) {
            return false;
        }
    }
    if (!makeRe((_a = pattern.pathname) !== null && _a !== void 0 ? _a : '**').test(url.pathname)) {
        return false;
    }
    return true;
}
export function hasMatch(domains, remotePatterns, url) {
    return (domains.some((domain) => url.hostname === domain) ||
        remotePatterns.some((p) => matchRemotePattern(p, url)));
}
