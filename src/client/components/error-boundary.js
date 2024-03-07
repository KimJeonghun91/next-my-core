'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { usePathname } from './navigation';
import { isNextRouterError } from './is-next-router-error';
const styles = {
    error: {
        // https://github.com/sindresorhus/modern-normalize/blob/main/modern-normalize.css#L38-L52
        fontFamily: 'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
        height: '100vh',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '28px',
        margin: '0 8px',
    },
};
// if we are revalidating we want to re-throw the error so the
// function crashes so we can maintain our previous cache
// instead of caching the error page
function HandleISRError({ error }) {
    var _a;
    if (typeof fetch.__nextGetStaticStore === 'function') {
        const store = (_a = fetch.__nextGetStaticStore()) === null || _a === void 0 ? void 0 : _a.getStore();
        if ((store === null || store === void 0 ? void 0 : store.isRevalidate) || (store === null || store === void 0 ? void 0 : store.isStaticGeneration)) {
            console.error(error);
            throw error;
        }
    }
    return null;
}
export class ErrorBoundaryHandler extends React.Component {
    constructor(props) {
        super(props);
        this.reset = () => {
            this.setState({ error: null });
        };
        this.state = { error: null, previousPathname: this.props.pathname };
    }
    static getDerivedStateFromError(error) {
        if (isNextRouterError(error)) {
            // Re-throw if an expected internal Next.js router error occurs
            // this means it should be handled by a different boundary (such as a NotFound boundary in a parent segment)
            throw error;
        }
        return { error };
    }
    static getDerivedStateFromProps(props, state) {
        /**
         * Handles reset of the error boundary when a navigation happens.
         * Ensures the error boundary does not stay enabled when navigating to a new page.
         * Approach of setState in render is safe as it checks the previous pathname and then overrides
         * it as outlined in https://react.dev/reference/react/useState#storing-information-from-previous-renders
         */
        if (props.pathname !== state.previousPathname && state.error) {
            return {
                error: null,
                previousPathname: props.pathname,
            };
        }
        return {
            error: state.error,
            previousPathname: props.pathname,
        };
    }
    render() {
        if (this.state.error) {
            return (_jsxs(_Fragment, { children: [_jsx(HandleISRError, { error: this.state.error }), this.props.errorStyles, this.props.errorScripts, _jsx(this.props.errorComponent, { error: this.state.error, reset: this.reset })] }));
        }
        return this.props.children;
    }
}
export function GlobalError({ error }) {
    const digest = error === null || error === void 0 ? void 0 : error.digest;
    return (_jsxs("html", { id: "__next_error__", children: [_jsx("head", {}), _jsxs("body", { children: [_jsx(HandleISRError, { error: error }), _jsx("div", { style: styles.error, children: _jsxs("div", { children: [_jsx("h2", { style: styles.text, children: `Application error: a ${digest ? 'server' : 'client'}-side exception has occurred (see the ${digest ? 'server logs' : 'browser console'} for more information).` }), digest ? _jsx("p", { style: styles.text, children: `Digest: ${digest}` }) : null] }) })] })] }));
}
// Exported so that the import signature in the loaders can be identical to user
// supplied custom global error signatures.
export default GlobalError;
/**
 * Handles errors through `getDerivedStateFromError`.
 * Renders the provided error component and provides a way to `reset` the error boundary state.
 */
/**
 * Renders error boundary with the provided "errorComponent" property as the fallback.
 * If no "errorComponent" property is provided it renders the children without an error boundary.
 */
export function ErrorBoundary({ errorComponent, errorStyles, errorScripts, children, }) {
    const pathname = usePathname();
    if (errorComponent) {
        return (_jsx(ErrorBoundaryHandler, { pathname: pathname, errorComponent: errorComponent, errorStyles: errorStyles, errorScripts: errorScripts, children: children }));
    }
    return _jsx(_Fragment, { children: children });
}
