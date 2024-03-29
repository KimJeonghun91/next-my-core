"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    getSocialImageFallbackMetadataBase: null,
    isStringOrURL: null,
    resolveUrl: null,
    resolveRelativeUrl: null,
    resolveAbsoluteUrlWithPathname: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getSocialImageFallbackMetadataBase: function() {
        return getSocialImageFallbackMetadataBase;
    },
    isStringOrURL: function() {
        return isStringOrURL;
    },
    resolveUrl: function() {
        return resolveUrl;
    },
    resolveRelativeUrl: function() {
        return resolveRelativeUrl;
    },
    resolveAbsoluteUrlWithPathname: function() {
        return resolveAbsoluteUrlWithPathname;
    }
});
const _path = /*#__PURE__*/ _interop_require_default(require("../../../shared/lib/isomorphic/path"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function isStringOrURL(icon) {
    return typeof icon === "string" || icon instanceof URL;
}
function createLocalMetadataBase() {
    return new URL(`http://localhost:${process.env.PORT || 3000}`);
}
function getSocialImageFallbackMetadataBase(metadataBase) {
    const isMetadataBaseMissing = !metadataBase;
    const defaultMetadataBase = createLocalMetadataBase();
    const deploymentUrl = process.env.VERCEL_URL && new URL(`https://${process.env.VERCEL_URL}`);
    let fallbackMetadataBase;
    if (process.env.NODE_ENV === "development") {
        fallbackMetadataBase = defaultMetadataBase;
    } else {
        fallbackMetadataBase = process.env.NODE_ENV === "production" && deploymentUrl && process.env.VERCEL_ENV === "preview" ? deploymentUrl : metadataBase || deploymentUrl || defaultMetadataBase;
    }
    return {
        fallbackMetadataBase,
        isMetadataBaseMissing
    };
}
function resolveUrl(url, metadataBase) {
    if (url instanceof URL) return url;
    if (!url) return null;
    try {
        // If we can construct a URL instance from url, ignore metadataBase
        const parsedUrl = new URL(url);
        return parsedUrl;
    } catch  {}
    if (!metadataBase) {
        metadataBase = createLocalMetadataBase();
    }
    // Handle relative or absolute paths
    const basePath = metadataBase.pathname || "";
    const joinedPath = _path.default.posix.join(basePath, url);
    return new URL(joinedPath, metadataBase);
}
// Resolve with `pathname` if `url` is a relative path.
function resolveRelativeUrl(url, pathname) {
    if (typeof url === "string" && url.startsWith("./")) {
        return _path.default.posix.resolve(pathname, url);
    }
    return url;
}
// Resolve `pathname` if `url` is a relative path the compose with `metadataBase`.
function resolveAbsoluteUrlWithPathname(url, metadataBase, { trailingSlash, pathname }) {
    url = resolveRelativeUrl(url, pathname);
    // Get canonicalUrl without trailing slash
    let canonicalUrl = "";
    const result = metadataBase ? resolveUrl(url, metadataBase) : url;
    if (typeof result === "string") {
        canonicalUrl = result;
    } else {
        canonicalUrl = result.pathname === "/" ? result.origin : result.href;
    }
    // Add trailing slash if it's enabled
    return trailingSlash && !canonicalUrl.endsWith("/") ? `${canonicalUrl}/` : canonicalUrl;
}

//# sourceMappingURL=resolve-url.js.map