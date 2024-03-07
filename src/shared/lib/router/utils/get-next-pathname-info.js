import { normalizeLocalePath } from '../../i18n/normalize-locale-path';
import { removePathPrefix } from './remove-path-prefix';
import { pathHasPrefix } from './path-has-prefix';
export function getNextPathnameInfo(pathname, options) {
    var _a, _b;
    const { basePath, i18n, trailingSlash } = (_a = options.nextConfig) !== null && _a !== void 0 ? _a : {};
    const info = {
        pathname,
        trailingSlash: pathname !== '/' ? pathname.endsWith('/') : trailingSlash,
    };
    if (basePath && pathHasPrefix(info.pathname, basePath)) {
        info.pathname = removePathPrefix(info.pathname, basePath);
        info.basePath = basePath;
    }
    let pathnameNoDataPrefix = info.pathname;
    if (info.pathname.startsWith('/_next/data/') &&
        info.pathname.endsWith('.json')) {
        const paths = info.pathname
            .replace(/^\/_next\/data\//, '')
            .replace(/\.json$/, '')
            .split('/');
        const buildId = paths[0];
        info.buildId = buildId;
        pathnameNoDataPrefix =
            paths[1] !== 'index' ? `/${paths.slice(1).join('/')}` : '/';
        // update pathname with normalized if enabled although
        // we use normalized to populate locale info still
        if (options.parseData === true) {
            info.pathname = pathnameNoDataPrefix;
        }
    }
    // If provided, use the locale route normalizer to detect the locale instead
    // of the function below.
    if (i18n) {
        let result = options.i18nProvider
            ? options.i18nProvider.analyze(info.pathname)
            : normalizeLocalePath(info.pathname, i18n.locales);
        info.locale = result.detectedLocale;
        info.pathname = (_b = result.pathname) !== null && _b !== void 0 ? _b : info.pathname;
        if (!result.detectedLocale && info.buildId) {
            result = options.i18nProvider
                ? options.i18nProvider.analyze(pathnameNoDataPrefix)
                : normalizeLocalePath(pathnameNoDataPrefix, i18n.locales);
            if (result.detectedLocale) {
                info.locale = result.detectedLocale;
            }
        }
    }
    return info;
}
