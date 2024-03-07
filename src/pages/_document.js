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
import { createElement as _createElement } from "react";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { OPTIMIZED_FONT_PROVIDERS, NEXT_BUILTIN_DOCUMENT, } from '../shared/lib/constants';
import { getPageFiles } from '../server/get-page-files';
import { htmlEscapeJsonString } from '../server/htmlescape';
import isError from '../lib/is-error';
import { HtmlContext, useHtmlContext, } from '../shared/lib/html-context.shared-runtime';
/** Set of pages that have triggered a large data warning on production mode. */
const largePageDataWarnings = new Set();
function getDocumentFiles(buildManifest, pathname, inAmpMode) {
    const sharedFiles = getPageFiles(buildManifest, '/_app');
    const pageFiles = process.env.NEXT_RUNTIME !== 'edge' && inAmpMode
        ? []
        : getPageFiles(buildManifest, pathname);
    return {
        sharedFiles,
        pageFiles,
        allFiles: [...new Set([...sharedFiles, ...pageFiles])],
    };
}
function getPolyfillScripts(context, props) {
    // polyfills.js has to be rendered as nomodule without async
    // It also has to be the first script to load
    const { assetPrefix, buildManifest, assetQueryString, disableOptimizedLoading, crossOrigin, } = context;
    return buildManifest.polyfillFiles
        .filter((polyfill) => polyfill.endsWith('.js') && !polyfill.endsWith('.module.js'))
        .map((polyfill) => (_jsx("script", { defer: !disableOptimizedLoading, nonce: props.nonce, crossOrigin: props.crossOrigin || crossOrigin, noModule: true, src: `${assetPrefix}/_next/${polyfill}${assetQueryString}` }, polyfill)));
}
function hasComponentProps(child) {
    return !!child && !!child.props;
}
function AmpStyles({ styles, }) {
    if (!styles)
        return null;
    // try to parse styles from fragment for backwards compat
    const curStyles = Array.isArray(styles)
        ? styles
        : [];
    if (
    // @ts-ignore Property 'props' does not exist on type ReactElement
    styles.props &&
        // @ts-ignore Property 'props' does not exist on type ReactElement
        Array.isArray(styles.props.children)) {
        const hasStyles = (el) => { var _a, _b; return (_b = (_a = el === null || el === void 0 ? void 0 : el.props) === null || _a === void 0 ? void 0 : _a.dangerouslySetInnerHTML) === null || _b === void 0 ? void 0 : _b.__html; };
        // @ts-ignore Property 'props' does not exist on type ReactElement
        styles.props.children.forEach((child) => {
            if (Array.isArray(child)) {
                child.forEach((el) => hasStyles(el) && curStyles.push(el));
            }
            else if (hasStyles(child)) {
                curStyles.push(child);
            }
        });
    }
    /* Add custom styles before AMP styles to prevent accidental overrides */
    return (_jsx("style", { "amp-custom": "", dangerouslySetInnerHTML: {
            __html: curStyles
                .map((style) => style.props.dangerouslySetInnerHTML.__html)
                .join('')
                .replace(/\/\*# sourceMappingURL=.*\*\//g, '')
                .replace(/\/\*@ sourceURL=.*?\*\//g, ''),
        } }));
}
function getDynamicChunks(context, props, files) {
    const { dynamicImports, assetPrefix, isDevelopment, assetQueryString, disableOptimizedLoading, crossOrigin, } = context;
    return dynamicImports.map((file) => {
        if (!file.endsWith('.js') || files.allFiles.includes(file))
            return null;
        return (_jsx("script", { async: !isDevelopment && disableOptimizedLoading, defer: !disableOptimizedLoading, src: `${assetPrefix}/_next/${encodeURI(file)}${assetQueryString}`, nonce: props.nonce, crossOrigin: props.crossOrigin || crossOrigin }, file));
    });
}
function getScripts(context, props, files) {
    var _a;
    const { assetPrefix, buildManifest, isDevelopment, assetQueryString, disableOptimizedLoading, crossOrigin, } = context;
    const normalScripts = files.allFiles.filter((file) => file.endsWith('.js'));
    const lowPriorityScripts = (_a = buildManifest.lowPriorityFiles) === null || _a === void 0 ? void 0 : _a.filter((file) => file.endsWith('.js'));
    return [...normalScripts, ...lowPriorityScripts].map((file) => {
        return (_jsx("script", { src: `${assetPrefix}/_next/${encodeURI(file)}${assetQueryString}`, nonce: props.nonce, async: !isDevelopment && disableOptimizedLoading, defer: !disableOptimizedLoading, crossOrigin: props.crossOrigin || crossOrigin }, file));
    });
}
function getPreNextWorkerScripts(context, props) {
    const { assetPrefix, scriptLoader, crossOrigin, nextScriptWorkers } = context;
    // disable `nextScriptWorkers` in edge runtime
    if (!nextScriptWorkers || process.env.NEXT_RUNTIME === 'edge')
        return null;
    try {
        let { partytownSnippet,
        // @ts-ignore: Prevent webpack from processing this require
         } = __non_webpack_require__('@builder.io/partytown/integration');
        const children = Array.isArray(props.children)
            ? props.children
            : [props.children];
        // Check to see if the user has defined their own Partytown configuration
        const userDefinedConfig = children.find((child) => {
            var _a, _b;
            return hasComponentProps(child) &&
                ((_b = (_a = child === null || child === void 0 ? void 0 : child.props) === null || _a === void 0 ? void 0 : _a.dangerouslySetInnerHTML) === null || _b === void 0 ? void 0 : _b.__html.length) &&
                'data-partytown-config' in child.props;
        });
        return (_jsxs(_Fragment, { children: [!userDefinedConfig && (_jsx("script", { "data-partytown-config": "", dangerouslySetInnerHTML: {
                        __html: `
            partytown = {
              lib: "${assetPrefix}/_next/static/~partytown/"
            };
          `,
                    } })), _jsx("script", { "data-partytown": "", dangerouslySetInnerHTML: {
                        __html: partytownSnippet(),
                    } }), (scriptLoader.worker || []).map((file, index) => {
                    const { strategy, src, children: scriptChildren, dangerouslySetInnerHTML } = file, scriptProps = __rest(file, ["strategy", "src", "children", "dangerouslySetInnerHTML"]);
                    let srcProps = {};
                    if (src) {
                        // Use external src if provided
                        srcProps.src = src;
                    }
                    else if (dangerouslySetInnerHTML &&
                        dangerouslySetInnerHTML.__html) {
                        // Embed inline script if provided with dangerouslySetInnerHTML
                        srcProps.dangerouslySetInnerHTML = {
                            __html: dangerouslySetInnerHTML.__html,
                        };
                    }
                    else if (scriptChildren) {
                        // Embed inline script if provided with children
                        srcProps.dangerouslySetInnerHTML = {
                            __html: typeof scriptChildren === 'string'
                                ? scriptChildren
                                : Array.isArray(scriptChildren)
                                    ? scriptChildren.join('')
                                    : '',
                        };
                    }
                    else {
                        throw new Error('Invalid usage of next/script. Did you forget to include a src attribute or an inline script? https://nextjs.org/docs/messages/invalid-script');
                    }
                    return (_createElement("script", Object.assign({}, srcProps, scriptProps, { type: "text/partytown", key: src || index, nonce: props.nonce, "data-nscript": "worker", crossOrigin: props.crossOrigin || crossOrigin })));
                })] }));
    }
    catch (err) {
        if (isError(err) && err.code !== 'MODULE_NOT_FOUND') {
            console.warn(`Warning: ${err.message}`);
        }
        return null;
    }
}
function getPreNextScripts(context, props) {
    const { scriptLoader, disableOptimizedLoading, crossOrigin } = context;
    const webWorkerScripts = getPreNextWorkerScripts(context, props);
    const beforeInteractiveScripts = (scriptLoader.beforeInteractive || [])
        .filter((script) => script.src)
        .map((file, index) => {
        var _a;
        const { strategy } = file, scriptProps = __rest(file, ["strategy"]);
        return (_createElement("script", Object.assign({}, scriptProps, { key: scriptProps.src || index, defer: (_a = scriptProps.defer) !== null && _a !== void 0 ? _a : !disableOptimizedLoading, nonce: props.nonce, "data-nscript": "beforeInteractive", crossOrigin: props.crossOrigin || crossOrigin })));
    });
    return (_jsxs(_Fragment, { children: [webWorkerScripts, beforeInteractiveScripts] }));
}
function getHeadHTMLProps(props) {
    const { crossOrigin, nonce } = props, restProps = __rest(props
    // This assignment is necessary for additional type checking to avoid unsupported attributes in <head>
    , ["crossOrigin", "nonce"]);
    // This assignment is necessary for additional type checking to avoid unsupported attributes in <head>
    const headProps = restProps;
    return headProps;
}
function getAmpPath(ampPath, asPath) {
    return ampPath || `${asPath}${asPath.includes('?') ? '&' : '?'}amp=1`;
}
function getNextFontLinkTags(nextFontManifest, dangerousAsPath, assetPrefix = '') {
    if (!nextFontManifest) {
        return {
            preconnect: null,
            preload: null,
        };
    }
    const appFontsEntry = nextFontManifest.pages['/_app'];
    const pageFontsEntry = nextFontManifest.pages[dangerousAsPath];
    const preloadedFontFiles = [
        ...(appFontsEntry !== null && appFontsEntry !== void 0 ? appFontsEntry : []),
        ...(pageFontsEntry !== null && pageFontsEntry !== void 0 ? pageFontsEntry : []),
    ];
    // If no font files should preload but there's an entry for the path, add a preconnect tag.
    const preconnectToSelf = !!(preloadedFontFiles.length === 0 &&
        (appFontsEntry || pageFontsEntry));
    return {
        preconnect: preconnectToSelf ? (_jsx("link", { "data-next-font": nextFontManifest.pagesUsingSizeAdjust ? 'size-adjust' : '', rel: "preconnect", href: "/", crossOrigin: "anonymous" })) : null,
        preload: preloadedFontFiles
            ? preloadedFontFiles.map((fontFile) => {
                const ext = /\.(woff|woff2|eot|ttf|otf)$/.exec(fontFile)[1];
                return (_jsx("link", { rel: "preload", href: `${assetPrefix}/_next/${encodeURI(fontFile)}`, as: "font", type: `font/${ext}`, crossOrigin: "anonymous", "data-next-font": fontFile.includes('-s') ? 'size-adjust' : '' }, fontFile));
            })
            : null,
    };
}
// Use `React.Component` to avoid errors from the RSC checks because
// it can't be imported directly in Server Components:
//
//   import { Component } from 'react'
//
// More info: https://github.com/vercel/next.js/pull/40686
export class Head extends React.Component {
    getCssLinks(files) {
        const { assetPrefix, assetQueryString, dynamicImports, crossOrigin, optimizeCss, optimizeFonts, } = this.context;
        const cssFiles = files.allFiles.filter((f) => f.endsWith('.css'));
        const sharedFiles = new Set(files.sharedFiles);
        // Unmanaged files are CSS files that will be handled directly by the
        // webpack runtime (`mini-css-extract-plugin`).
        let unmangedFiles = new Set([]);
        let dynamicCssFiles = Array.from(new Set(dynamicImports.filter((file) => file.endsWith('.css'))));
        if (dynamicCssFiles.length) {
            const existing = new Set(cssFiles);
            dynamicCssFiles = dynamicCssFiles.filter((f) => !(existing.has(f) || sharedFiles.has(f)));
            unmangedFiles = new Set(dynamicCssFiles);
            cssFiles.push(...dynamicCssFiles);
        }
        let cssLinkElements = [];
        cssFiles.forEach((file) => {
            const isSharedFile = sharedFiles.has(file);
            if (!optimizeCss) {
                cssLinkElements.push(_jsx("link", { nonce: this.props.nonce, rel: "preload", href: `${assetPrefix}/_next/${encodeURI(file)}${assetQueryString}`, as: "style", crossOrigin: this.props.crossOrigin || crossOrigin }, `${file}-preload`));
            }
            const isUnmanagedFile = unmangedFiles.has(file);
            cssLinkElements.push(_jsx("link", { nonce: this.props.nonce, rel: "stylesheet", href: `${assetPrefix}/_next/${encodeURI(file)}${assetQueryString}`, crossOrigin: this.props.crossOrigin || crossOrigin, "data-n-g": isUnmanagedFile ? undefined : isSharedFile ? '' : undefined, "data-n-p": isUnmanagedFile ? undefined : isSharedFile ? undefined : '' }, file));
        });
        if (process.env.NODE_ENV !== 'development' && optimizeFonts) {
            cssLinkElements = this.makeStylesheetInert(cssLinkElements);
        }
        return cssLinkElements.length === 0 ? null : cssLinkElements;
    }
    getPreloadDynamicChunks() {
        const { dynamicImports, assetPrefix, assetQueryString, crossOrigin } = this.context;
        return (dynamicImports
            .map((file) => {
            if (!file.endsWith('.js')) {
                return null;
            }
            return (_jsx("link", { rel: "preload", href: `${assetPrefix}/_next/${encodeURI(file)}${assetQueryString}`, as: "script", nonce: this.props.nonce, crossOrigin: this.props.crossOrigin || crossOrigin }, file));
        })
            // Filter out nulled scripts
            .filter(Boolean));
    }
    getPreloadMainLinks(files) {
        const { assetPrefix, assetQueryString, scriptLoader, crossOrigin } = this.context;
        const preloadFiles = files.allFiles.filter((file) => {
            return file.endsWith('.js');
        });
        return [
            ...(scriptLoader.beforeInteractive || []).map((file) => (_jsx("link", { nonce: this.props.nonce, rel: "preload", href: file.src, as: "script", crossOrigin: this.props.crossOrigin || crossOrigin }, file.src))),
            ...preloadFiles.map((file) => (_jsx("link", { nonce: this.props.nonce, rel: "preload", href: `${assetPrefix}/_next/${encodeURI(file)}${assetQueryString}`, as: "script", crossOrigin: this.props.crossOrigin || crossOrigin }, file))),
        ];
    }
    getBeforeInteractiveInlineScripts() {
        const { scriptLoader } = this.context;
        const { nonce, crossOrigin } = this.props;
        return (scriptLoader.beforeInteractive || [])
            .filter((script) => !script.src && (script.dangerouslySetInnerHTML || script.children))
            .map((file, index) => {
            const { strategy, children, dangerouslySetInnerHTML, src } = file, scriptProps = __rest(file, ["strategy", "children", "dangerouslySetInnerHTML", "src"]);
            let html = '';
            if (dangerouslySetInnerHTML && dangerouslySetInnerHTML.__html) {
                html = dangerouslySetInnerHTML.__html;
            }
            else if (children) {
                html =
                    typeof children === 'string'
                        ? children
                        : Array.isArray(children)
                            ? children.join('')
                            : '';
            }
            return (_createElement("script", Object.assign({}, scriptProps, { dangerouslySetInnerHTML: { __html: html }, key: scriptProps.id || index, nonce: nonce, "data-nscript": "beforeInteractive", crossOrigin: crossOrigin ||
                    process.env.__NEXT_CROSS_ORIGIN })));
        });
    }
    getDynamicChunks(files) {
        return getDynamicChunks(this.context, this.props, files);
    }
    getPreNextScripts() {
        return getPreNextScripts(this.context, this.props);
    }
    getScripts(files) {
        return getScripts(this.context, this.props, files);
    }
    getPolyfillScripts() {
        return getPolyfillScripts(this.context, this.props);
    }
    makeStylesheetInert(node) {
        return React.Children.map(node, (c) => {
            var _a, _b;
            if ((c === null || c === void 0 ? void 0 : c.type) === 'link' &&
                ((_a = c === null || c === void 0 ? void 0 : c.props) === null || _a === void 0 ? void 0 : _a.href) &&
                OPTIMIZED_FONT_PROVIDERS.some(({ url }) => { var _a, _b; return (_b = (_a = c === null || c === void 0 ? void 0 : c.props) === null || _a === void 0 ? void 0 : _a.href) === null || _b === void 0 ? void 0 : _b.startsWith(url); })) {
                const newProps = Object.assign(Object.assign({}, (c.props || {})), { 'data-href': c.props.href, href: undefined });
                return React.cloneElement(c, newProps);
            }
            else if ((_b = c === null || c === void 0 ? void 0 : c.props) === null || _b === void 0 ? void 0 : _b.children) {
                const newProps = Object.assign(Object.assign({}, (c.props || {})), { children: this.makeStylesheetInert(c.props.children) });
                return React.cloneElement(c, newProps);
            }
            return c;
            // @types/react bug. Returned value from .map will not be `null` if you pass in `[null]`
        }).filter(Boolean);
    }
    render() {
        var _a, _b;
        const { styles, ampPath, inAmpMode, hybridAmp, canonicalBase, __NEXT_DATA__, dangerousAsPath, headTags, unstable_runtimeJS, unstable_JsPreload, disableOptimizedLoading, optimizeCss, optimizeFonts, assetPrefix, nextFontManifest, } = this.context;
        const disableRuntimeJS = unstable_runtimeJS === false;
        const disableJsPreload = unstable_JsPreload === false || !disableOptimizedLoading;
        this.context.docComponentsRendered.Head = true;
        let { head } = this.context;
        let cssPreloads = [];
        let otherHeadElements = [];
        if (head) {
            head.forEach((c) => {
                let metaTag;
                if (this.context.strictNextHead) {
                    metaTag = React.createElement('meta', {
                        name: 'next-head',
                        content: '1',
                    });
                }
                if (c &&
                    c.type === 'link' &&
                    c.props['rel'] === 'preload' &&
                    c.props['as'] === 'style') {
                    metaTag && cssPreloads.push(metaTag);
                    cssPreloads.push(c);
                }
                else {
                    if (c) {
                        if (metaTag && (c.type !== 'meta' || !c.props['charSet'])) {
                            otherHeadElements.push(metaTag);
                        }
                        otherHeadElements.push(c);
                    }
                }
            });
            head = cssPreloads.concat(otherHeadElements);
        }
        let children = React.Children.toArray(this.props.children).filter(Boolean);
        // show a warning if Head contains <title> (only in development)
        if (process.env.NODE_ENV !== 'production') {
            children = React.Children.map(children, (child) => {
                var _a, _b;
                const isReactHelmet = (_a = child === null || child === void 0 ? void 0 : child.props) === null || _a === void 0 ? void 0 : _a['data-react-helmet'];
                if (!isReactHelmet) {
                    if ((child === null || child === void 0 ? void 0 : child.type) === 'title') {
                        console.warn("Warning: <title> should not be used in _document.js's <Head>. https://nextjs.org/docs/messages/no-document-title");
                    }
                    else if ((child === null || child === void 0 ? void 0 : child.type) === 'meta' &&
                        ((_b = child === null || child === void 0 ? void 0 : child.props) === null || _b === void 0 ? void 0 : _b.name) === 'viewport') {
                        console.warn("Warning: viewport meta tags should not be used in _document.js's <Head>. https://nextjs.org/docs/messages/no-document-viewport-meta");
                    }
                }
                return child;
                // @types/react bug. Returned value from .map will not be `null` if you pass in `[null]`
            });
            if (this.props.crossOrigin)
                console.warn('Warning: `Head` attribute `crossOrigin` is deprecated. https://nextjs.org/docs/messages/doc-crossorigin-deprecated');
        }
        if (process.env.NODE_ENV !== 'development' &&
            optimizeFonts &&
            !(process.env.NEXT_RUNTIME !== 'edge' && inAmpMode)) {
            children = this.makeStylesheetInert(children);
        }
        let hasAmphtmlRel = false;
        let hasCanonicalRel = false;
        // show warning and remove conflicting amp head tags
        head = React.Children.map(head || [], (child) => {
            if (!child)
                return child;
            const { type, props } = child;
            if (process.env.NEXT_RUNTIME !== 'edge' && inAmpMode) {
                let badProp = '';
                if (type === 'meta' && props.name === 'viewport') {
                    badProp = 'name="viewport"';
                }
                else if (type === 'link' && props.rel === 'canonical') {
                    hasCanonicalRel = true;
                }
                else if (type === 'script') {
                    // only block if
                    // 1. it has a src and isn't pointing to ampproject's CDN
                    // 2. it is using dangerouslySetInnerHTML without a type or
                    // a type of text/javascript
                    if ((props.src && props.src.indexOf('ampproject') < -1) ||
                        (props.dangerouslySetInnerHTML &&
                            (!props.type || props.type === 'text/javascript'))) {
                        badProp = '<script';
                        Object.keys(props).forEach((prop) => {
                            badProp += ` ${prop}="${props[prop]}"`;
                        });
                        badProp += '/>';
                    }
                }
                if (badProp) {
                    console.warn(`Found conflicting amp tag "${child.type}" with conflicting prop ${badProp} in ${__NEXT_DATA__.page}. https://nextjs.org/docs/messages/conflicting-amp-tag`);
                    return null;
                }
            }
            else {
                // non-amp mode
                if (type === 'link' && props.rel === 'amphtml') {
                    hasAmphtmlRel = true;
                }
            }
            return child;
            // @types/react bug. Returned value from .map will not be `null` if you pass in `[null]`
        });
        const files = getDocumentFiles(this.context.buildManifest, this.context.__NEXT_DATA__.page, process.env.NEXT_RUNTIME !== 'edge' && inAmpMode);
        const nextFontLinkTags = getNextFontLinkTags(nextFontManifest, dangerousAsPath, assetPrefix);
        return (_jsxs("head", Object.assign({}, getHeadHTMLProps(this.props), { children: [this.context.isDevelopment && (_jsxs(_Fragment, { children: [_jsx("style", { "data-next-hide-fouc": true, "data-ampdevmode": process.env.NEXT_RUNTIME !== 'edge' && inAmpMode
                                ? 'true'
                                : undefined, dangerouslySetInnerHTML: {
                                __html: `body{display:none}`,
                            } }), _jsx("noscript", { "data-next-hide-fouc": true, "data-ampdevmode": process.env.NEXT_RUNTIME !== 'edge' && inAmpMode
                                ? 'true'
                                : undefined, children: _jsx("style", { dangerouslySetInnerHTML: {
                                    __html: `body{display:block}`,
                                } }) })] })), head, this.context.strictNextHead ? null : (_jsx("meta", { name: "next-head-count", content: React.Children.count(head || []).toString() })), children, optimizeFonts && _jsx("meta", { name: "next-font-preconnect" }), nextFontLinkTags.preconnect, nextFontLinkTags.preload, process.env.NEXT_RUNTIME !== 'edge' && inAmpMode && (_jsxs(_Fragment, { children: [_jsx("meta", { name: "viewport", content: "width=device-width,minimum-scale=1,initial-scale=1" }), !hasCanonicalRel && (_jsx("link", { rel: "canonical", href: canonicalBase +
                                require('../server/utils').cleanAmpPath(dangerousAsPath) })), _jsx("link", { rel: "preload", as: "script", href: "https://cdn.ampproject.org/v0.js" }), _jsx(AmpStyles, { styles: styles }), _jsx("style", { "amp-boilerplate": "", dangerouslySetInnerHTML: {
                                __html: `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`,
                            } }), _jsx("noscript", { children: _jsx("style", { "amp-boilerplate": "", dangerouslySetInnerHTML: {
                                    __html: `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`,
                                } }) }), _jsx("script", { async: true, src: "https://cdn.ampproject.org/v0.js" })] })), !(process.env.NEXT_RUNTIME !== 'edge' && inAmpMode) && (_jsxs(_Fragment, { children: [!hasAmphtmlRel && hybridAmp && (_jsx("link", { rel: "amphtml", href: canonicalBase + getAmpPath(ampPath, dangerousAsPath) })), this.getBeforeInteractiveInlineScripts(), !optimizeCss && this.getCssLinks(files), !optimizeCss && _jsx("noscript", { "data-n-css": (_a = this.props.nonce) !== null && _a !== void 0 ? _a : '' }), !disableRuntimeJS &&
                            !disableJsPreload &&
                            this.getPreloadDynamicChunks(), !disableRuntimeJS &&
                            !disableJsPreload &&
                            this.getPreloadMainLinks(files), !disableOptimizedLoading &&
                            !disableRuntimeJS &&
                            this.getPolyfillScripts(), !disableOptimizedLoading &&
                            !disableRuntimeJS &&
                            this.getPreNextScripts(), !disableOptimizedLoading &&
                            !disableRuntimeJS &&
                            this.getDynamicChunks(files), !disableOptimizedLoading &&
                            !disableRuntimeJS &&
                            this.getScripts(files), optimizeCss && this.getCssLinks(files), optimizeCss && _jsx("noscript", { "data-n-css": (_b = this.props.nonce) !== null && _b !== void 0 ? _b : '' }), this.context.isDevelopment && (
                        // this element is used to mount development styles so the
                        // ordering matches production
                        // (by default, style-loader injects at the bottom of <head />)
                        _jsx("noscript", { id: "__next_css__DO_NOT_USE__" })), styles || null] })), React.createElement(React.Fragment, {}, ...(headTags || []))] })));
    }
}
Head.contextType = HtmlContext;
function handleDocumentScriptLoaderItems(scriptLoader, __NEXT_DATA__, props) {
    var _a, _b, _c, _d;
    if (!props.children)
        return;
    const scriptLoaderItems = [];
    const children = Array.isArray(props.children)
        ? props.children
        : [props.children];
    const headChildren = (_b = (_a = children.find((child) => child.type === Head)) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.children;
    const bodyChildren = (_d = (_c = children.find((child) => child.type === 'body')) === null || _c === void 0 ? void 0 : _c.props) === null || _d === void 0 ? void 0 : _d.children;
    // Scripts with beforeInteractive can be placed inside Head or <body> so children of both needs to be traversed
    const combinedChildren = [
        ...(Array.isArray(headChildren) ? headChildren : [headChildren]),
        ...(Array.isArray(bodyChildren) ? bodyChildren : [bodyChildren]),
    ];
    React.Children.forEach(combinedChildren, (child) => {
        var _a;
        if (!child)
            return;
        // When using the `next/script` component, register it in script loader.
        if ((_a = child.type) === null || _a === void 0 ? void 0 : _a.__nextScript) {
            if (child.props.strategy === 'beforeInteractive') {
                scriptLoader.beforeInteractive = (scriptLoader.beforeInteractive || []).concat([
                    Object.assign({}, child.props),
                ]);
                return;
            }
            else if (['lazyOnload', 'afterInteractive', 'worker'].includes(child.props.strategy)) {
                scriptLoaderItems.push(child.props);
                return;
            }
        }
    });
    __NEXT_DATA__.scriptLoader = scriptLoaderItems;
}
export class NextScript extends React.Component {
    getDynamicChunks(files) {
        return getDynamicChunks(this.context, this.props, files);
    }
    getPreNextScripts() {
        return getPreNextScripts(this.context, this.props);
    }
    getScripts(files) {
        return getScripts(this.context, this.props, files);
    }
    getPolyfillScripts() {
        return getPolyfillScripts(this.context, this.props);
    }
    static getInlineScriptSource(context) {
        const { __NEXT_DATA__, largePageDataBytes } = context;
        try {
            const data = JSON.stringify(__NEXT_DATA__);
            if (largePageDataWarnings.has(__NEXT_DATA__.page)) {
                return htmlEscapeJsonString(data);
            }
            const bytes = process.env.NEXT_RUNTIME === 'edge'
                ? new TextEncoder().encode(data).buffer.byteLength
                : Buffer.from(data).byteLength;
            const prettyBytes = require('../lib/pretty-bytes').default;
            if (largePageDataBytes && bytes > largePageDataBytes) {
                if (process.env.NODE_ENV === 'production') {
                    largePageDataWarnings.add(__NEXT_DATA__.page);
                }
                console.warn(`Warning: data for page "${__NEXT_DATA__.page}"${__NEXT_DATA__.page === context.dangerousAsPath
                    ? ''
                    : ` (path "${context.dangerousAsPath}")`} is ${prettyBytes(bytes)} which exceeds the threshold of ${prettyBytes(largePageDataBytes)}, this amount of data can reduce performance.\nSee more info here: https://nextjs.org/docs/messages/large-page-data`);
            }
            return htmlEscapeJsonString(data);
        }
        catch (err) {
            if (isError(err) && err.message.indexOf('circular structure') !== -1) {
                throw new Error(`Circular structure in "getInitialProps" result of page "${__NEXT_DATA__.page}". https://nextjs.org/docs/messages/circular-structure`);
            }
            throw err;
        }
    }
    render() {
        const { assetPrefix, inAmpMode, buildManifest, unstable_runtimeJS, docComponentsRendered, assetQueryString, disableOptimizedLoading, crossOrigin, } = this.context;
        const disableRuntimeJS = unstable_runtimeJS === false;
        docComponentsRendered.NextScript = true;
        if (process.env.NEXT_RUNTIME !== 'edge' && inAmpMode) {
            if (process.env.NODE_ENV === 'production') {
                return null;
            }
            const ampDevFiles = [
                ...buildManifest.devFiles,
                ...buildManifest.polyfillFiles,
                ...buildManifest.ampDevFiles,
            ];
            return (_jsxs(_Fragment, { children: [disableRuntimeJS ? null : (_jsx("script", { id: "__NEXT_DATA__", type: "application/json", nonce: this.props.nonce, crossOrigin: this.props.crossOrigin || crossOrigin, dangerouslySetInnerHTML: {
                            __html: NextScript.getInlineScriptSource(this.context),
                        }, "data-ampdevmode": true })), ampDevFiles.map((file) => (_jsx("script", { src: `${assetPrefix}/_next/${file}${assetQueryString}`, nonce: this.props.nonce, crossOrigin: this.props.crossOrigin || crossOrigin, "data-ampdevmode": true }, file)))] }));
        }
        if (process.env.NODE_ENV !== 'production') {
            if (this.props.crossOrigin)
                console.warn('Warning: `NextScript` attribute `crossOrigin` is deprecated. https://nextjs.org/docs/messages/doc-crossorigin-deprecated');
        }
        const files = getDocumentFiles(this.context.buildManifest, this.context.__NEXT_DATA__.page, process.env.NEXT_RUNTIME !== 'edge' && inAmpMode);
        return (_jsxs(_Fragment, { children: [!disableRuntimeJS && buildManifest.devFiles
                    ? buildManifest.devFiles.map((file) => (_jsx("script", { src: `${assetPrefix}/_next/${encodeURI(file)}${assetQueryString}`, nonce: this.props.nonce, crossOrigin: this.props.crossOrigin || crossOrigin }, file)))
                    : null, disableRuntimeJS ? null : (_jsx("script", { id: "__NEXT_DATA__", type: "application/json", nonce: this.props.nonce, crossOrigin: this.props.crossOrigin || crossOrigin, dangerouslySetInnerHTML: {
                        __html: NextScript.getInlineScriptSource(this.context),
                    } })), disableOptimizedLoading &&
                    !disableRuntimeJS &&
                    this.getPolyfillScripts(), disableOptimizedLoading &&
                    !disableRuntimeJS &&
                    this.getPreNextScripts(), disableOptimizedLoading &&
                    !disableRuntimeJS &&
                    this.getDynamicChunks(files), disableOptimizedLoading && !disableRuntimeJS && this.getScripts(files)] }));
    }
}
NextScript.contextType = HtmlContext;
export function Html(props) {
    const { inAmpMode, docComponentsRendered, locale, scriptLoader, __NEXT_DATA__, } = useHtmlContext();
    docComponentsRendered.Html = true;
    handleDocumentScriptLoaderItems(scriptLoader, __NEXT_DATA__, props);
    return (_jsx("html", Object.assign({}, props, { lang: props.lang || locale || undefined, amp: process.env.NEXT_RUNTIME !== 'edge' && inAmpMode ? '' : undefined, "data-ampdevmode": process.env.NEXT_RUNTIME !== 'edge' &&
            inAmpMode &&
            process.env.NODE_ENV !== 'production'
            ? ''
            : undefined })));
}
export function Main() {
    const { docComponentsRendered } = useHtmlContext();
    docComponentsRendered.Main = true;
    // @ts-ignore
    return _jsx("next-js-internal-body-render-target", {});
}
/**
 * `Document` component handles the initial `document` markup and renders only on the server side.
 * Commonly used for implementing server side rendering for `css-in-js` libraries.
 */
export default class Document extends React.Component {
    /**
     * `getInitialProps` hook returns the context object with the addition of `renderPage`.
     * `renderPage` callback executes `React` rendering logic synchronously to support server-rendering wrappers
     */
    static getInitialProps(ctx) {
        return ctx.defaultGetInitialProps(ctx);
    }
    render() {
        return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs("body", { children: [_jsx(Main, {}), _jsx(NextScript, {})] })] }));
    }
}
// Add a special property to the built-in `Document` component so later we can
// identify if a user customized `Document` is used or not.
const InternalFunctionDocument = function InternalFunctionDocument() {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs("body", { children: [_jsx(Main, {}), _jsx(NextScript, {})] })] }));
};
Document[NEXT_BUILTIN_DOCUMENT] = InternalFunctionDocument;
