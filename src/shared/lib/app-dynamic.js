import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import Loadable from './lazy-dynamic/loadable';
export {};
export default function dynamic(dynamicOptions, options) {
    const loadableOptions = {
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
    if (typeof dynamicOptions === 'function') {
        loadableOptions.loader = dynamicOptions;
    }
    return Loadable(Object.assign(Object.assign({}, loadableOptions), options));
}
