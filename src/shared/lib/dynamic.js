import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import Loadable from './loadable.shared-runtime';
const isServerSide = typeof window === 'undefined';
// Normalize loader to return the module as form { default: Component } for `React.lazy`.
// Also for backward compatible since next/dynamic allows to resolve a component directly with loader
// Client component reference proxy need to be converted to a module.
function convertModule(mod) {
    return { default: (mod === null || mod === void 0 ? void 0 : mod.default) || mod };
}
export function noSSR(LoadableInitializer, loadableOptions) {
    // Removing webpack and modules means react-loadable won't try preloading
    delete loadableOptions.webpack;
    delete loadableOptions.modules;
    // This check is necessary to prevent react-loadable from initializing on the server
    if (!isServerSide) {
        return LoadableInitializer(loadableOptions);
    }
    const Loading = loadableOptions.loading;
    // This will only be rendered on the server side
    return () => (_jsx(Loading, { error: null, isLoading: true, pastDelay: false, timedOut: false }));
}
export default function dynamic(dynamicOptions, options) {
    let loadableFn = Loadable;
    let loadableOptions = {
        // A loading component is not required, so we default it
        loading: ({ error, isLoading, pastDelay }) => {
            if (!pastDelay)
                return null;
            if (process.env.NODE_ENV !== 'production') {
                if (isLoading) {
                    return null;
                }
                if (error) {
                    return (_jsxs("p", { children: [error.message, _jsx("br", {}), error.stack] }));
                }
            }
            return null;
        },
    };
    // Support for direct import(), eg: dynamic(import('../hello-world'))
    // Note that this is only kept for the edge case where someone is passing in a promise as first argument
    // The react-loadable babel plugin will turn dynamic(import('../hello-world')) into dynamic(() => import('../hello-world'))
    // To make sure we don't execute the import without rendering first
    if (dynamicOptions instanceof Promise) {
        loadableOptions.loader = () => dynamicOptions;
        // Support for having import as a function, eg: dynamic(() => import('../hello-world'))
    }
    else if (typeof dynamicOptions === 'function') {
        loadableOptions.loader = dynamicOptions;
        // Support for having first argument being options, eg: dynamic({loader: import('../hello-world')})
    }
    else if (typeof dynamicOptions === 'object') {
        loadableOptions = Object.assign(Object.assign({}, loadableOptions), dynamicOptions);
    }
    // Support for passing options, eg: dynamic(import('../hello-world'), {loading: () => <p>Loading something</p>})
    loadableOptions = Object.assign(Object.assign({}, loadableOptions), options);
    const loaderFn = loadableOptions.loader;
    const loader = () => loaderFn != null
        ? loaderFn().then(convertModule)
        : Promise.resolve(convertModule(() => null));
    // coming from build/babel/plugins/react-loadable-plugin.js
    if (loadableOptions.loadableGenerated) {
        loadableOptions = Object.assign(Object.assign({}, loadableOptions), loadableOptions.loadableGenerated);
        delete loadableOptions.loadableGenerated;
    }
    // support for disabling server side rendering, eg: dynamic(() => import('../hello-world'), {ssr: false}).
    if (typeof loadableOptions.ssr === 'boolean' && !loadableOptions.ssr) {
        delete loadableOptions.webpack;
        delete loadableOptions.modules;
        return noSSR(loadableFn, loadableOptions);
    }
    return loadableFn(Object.assign(Object.assign({}, loadableOptions), { loader: loader }));
}
