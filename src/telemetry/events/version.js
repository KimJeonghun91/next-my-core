import path from 'path';
const EVENT_VERSION = 'NEXT_CLI_SESSION_STARTED';
function hasBabelConfig(dir) {
    var _a, _b, _c, _d;
    try {
        const noopFile = path.join(dir, 'noop.js');
        const res = require('next/dist/compiled/babel/core').loadPartialConfig({
            cwd: dir,
            filename: noopFile,
            sourceFileName: noopFile,
        });
        const isForTooling = ((_b = (_a = res.options) === null || _a === void 0 ? void 0 : _a.presets) === null || _b === void 0 ? void 0 : _b.every((e) => { var _a; return ((_a = e === null || e === void 0 ? void 0 : e.file) === null || _a === void 0 ? void 0 : _a.request) === 'next/babel'; })) && ((_d = (_c = res.options) === null || _c === void 0 ? void 0 : _c.plugins) === null || _d === void 0 ? void 0 : _d.length) === 0;
        return res.hasFilesystemConfig() && !isForTooling;
    }
    catch (_e) {
        return false;
    }
}
export function eventCliSession(dir, nextConfig, event) {
    // This should be an invariant, if it fails our build tooling is broken.
    if (typeof process.env.__NEXT_VERSION !== 'string') {
        return [];
    }
    const { images, i18n } = nextConfig || {};
    const payload = {
        nextVersion: process.env.__NEXT_VERSION,
        nodeVersion: process.version,
        cliCommand: event.cliCommand,
        isSrcDir: event.isSrcDir,
        hasNowJson: event.hasNowJson,
        isCustomServer: event.isCustomServer,
        hasNextConfig: nextConfig.configOrigin !== 'default',
        buildTarget: 'default',
        hasWebpackConfig: typeof (nextConfig === null || nextConfig === void 0 ? void 0 : nextConfig.webpack) === 'function',
        hasBabelConfig: hasBabelConfig(dir),
        imageEnabled: !!images,
        imageFutureEnabled: !!images,
        basePathEnabled: !!(nextConfig === null || nextConfig === void 0 ? void 0 : nextConfig.basePath),
        i18nEnabled: !!i18n,
        locales: (i18n === null || i18n === void 0 ? void 0 : i18n.locales) ? i18n.locales.join(',') : null,
        localeDomainsCount: (i18n === null || i18n === void 0 ? void 0 : i18n.domains) ? i18n.domains.length : null,
        localeDetectionEnabled: !i18n ? null : i18n.localeDetection !== false,
        imageDomainsCount: (images === null || images === void 0 ? void 0 : images.domains) ? images.domains.length : null,
        imageRemotePatternsCount: (images === null || images === void 0 ? void 0 : images.remotePatterns)
            ? images.remotePatterns.length
            : null,
        imageSizes: (images === null || images === void 0 ? void 0 : images.imageSizes) ? images.imageSizes.join(',') : null,
        imageLoader: images === null || images === void 0 ? void 0 : images.loader,
        imageFormats: (images === null || images === void 0 ? void 0 : images.formats) ? images.formats.join(',') : null,
        nextConfigOutput: (nextConfig === null || nextConfig === void 0 ? void 0 : nextConfig.output) || null,
        trailingSlashEnabled: !!(nextConfig === null || nextConfig === void 0 ? void 0 : nextConfig.trailingSlash),
        reactStrictMode: !!(nextConfig === null || nextConfig === void 0 ? void 0 : nextConfig.reactStrictMode),
        webpackVersion: event.webpackVersion || null,
        turboFlag: event.turboFlag || false,
        appDir: event.appDir,
        pagesDir: event.pagesDir,
    };
    return [{ eventName: EVENT_VERSION, payload }];
}
