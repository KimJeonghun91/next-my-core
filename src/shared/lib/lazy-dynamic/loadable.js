import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense, lazy } from 'react';
import { BailoutToCSR } from './dynamic-bailout-to-csr';
// Normalize loader to return the module as form { default: Component } for `React.lazy`.
// Also for backward compatible since next/dynamic allows to resolve a component directly with loader
// Client component reference proxy need to be converted to a module.
function convertModule(mod) {
    var _a;
    return { default: (_a = mod === null || mod === void 0 ? void 0 : mod.default) !== null && _a !== void 0 ? _a : mod };
}
const defaultOptions = {
    loader: () => Promise.resolve(convertModule(() => null)),
    loading: null,
    ssr: true,
};
function Loadable(options) {
    const opts = Object.assign(Object.assign({}, defaultOptions), options);
    const Lazy = lazy(() => opts.loader().then(convertModule));
    const Loading = opts.loading;
    function LoadableComponent(props) {
        const fallbackElement = Loading ? (_jsx(Loading, { isLoading: true, pastDelay: true, error: null })) : null;
        const children = opts.ssr ? (_jsx(Lazy, Object.assign({}, props))) : (_jsx(BailoutToCSR, { reason: "next/dynamic", children: _jsx(Lazy, Object.assign({}, props)) }));
        return _jsx(Suspense, { fallback: fallbackElement, children: children });
    }
    LoadableComponent.displayName = 'LoadableComponent';
    return LoadableComponent;
}
export default Loadable;
