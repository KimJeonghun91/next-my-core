import { jsx as _jsx } from "react/jsx-runtime";
/* global location */
import '../build/polyfills/polyfill-module';
// @ts-ignore react-dom/client exists when using React 18
import ReactDOMClient from 'react-dom/client';
import React, { use } from 'react';
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import { createFromReadableStream } from 'react-server-dom-webpack/client';
import { HeadManagerContext } from '../shared/lib/head-manager-context.shared-runtime';
import { GlobalLayoutRouterContext } from '../shared/lib/app-router-context.shared-runtime';
import onRecoverableError from './on-recoverable-error';
import { callServer } from './app-call-server';
import { isNextRouterError } from './components/is-next-router-error';
import { ActionQueueContext, createMutableActionQueue, } from '../shared/lib/router/action-queue';
// Since React doesn't call onerror for errors caught in error boundaries.
const origConsoleError = window.console.error;
window.console.error = (...args) => {
    if (isNextRouterError(args[0])) {
        return;
    }
    origConsoleError.apply(window.console, args);
};
window.addEventListener('error', (ev) => {
    if (isNextRouterError(ev.error)) {
        ev.preventDefault();
        return;
    }
});
/// <reference types="react-dom/experimental" />
const appElement = document;
const getCacheKey = () => {
    const { pathname, search } = location;
    return pathname + search;
};
const encoder = new TextEncoder();
let initialServerDataBuffer = undefined;
let initialServerDataWriter = undefined;
let initialServerDataLoaded = false;
let initialServerDataFlushed = false;
let initialFormStateData = null;
function nextServerDataCallback(seg) {
    if (seg[0] === 0) {
        initialServerDataBuffer = [];
    }
    else if (seg[0] === 1) {
        if (!initialServerDataBuffer)
            throw new Error('Unexpected server data: missing bootstrap script.');
        if (initialServerDataWriter) {
            initialServerDataWriter.enqueue(encoder.encode(seg[1]));
        }
        else {
            initialServerDataBuffer.push(seg[1]);
        }
    }
    else if (seg[0] === 2) {
        initialFormStateData = seg[1];
    }
}
// There might be race conditions between `nextServerDataRegisterWriter` and
// `DOMContentLoaded`. The former will be called when React starts to hydrate
// the root, the latter will be called when the DOM is fully loaded.
// For streaming, the former is called first due to partial hydration.
// For non-streaming, the latter can be called first.
// Hence, we use two variables `initialServerDataLoaded` and
// `initialServerDataFlushed` to make sure the writer will be closed and
// `initialServerDataBuffer` will be cleared in the right time.
function nextServerDataRegisterWriter(ctr) {
    if (initialServerDataBuffer) {
        initialServerDataBuffer.forEach((val) => {
            ctr.enqueue(encoder.encode(val));
        });
        if (initialServerDataLoaded && !initialServerDataFlushed) {
            ctr.close();
            initialServerDataFlushed = true;
            initialServerDataBuffer = undefined;
        }
    }
    initialServerDataWriter = ctr;
}
// When `DOMContentLoaded`, we can close all pending writers to finish hydration.
const DOMContentLoaded = function () {
    if (initialServerDataWriter && !initialServerDataFlushed) {
        initialServerDataWriter.close();
        initialServerDataFlushed = true;
        initialServerDataBuffer = undefined;
    }
    initialServerDataLoaded = true;
};
// It's possible that the DOM is already loaded.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
}
else {
    DOMContentLoaded();
}
const nextServerDataLoadingGlobal = (self.__next_f =
    self.__next_f || []);
nextServerDataLoadingGlobal.forEach(nextServerDataCallback);
nextServerDataLoadingGlobal.push = nextServerDataCallback;
function createResponseCache() {
    return new Map();
}
const rscCache = createResponseCache();
function useInitialServerResponse(cacheKey) {
    const response = rscCache.get(cacheKey);
    if (response)
        return response;
    const readable = new ReadableStream({
        start(controller) {
            nextServerDataRegisterWriter(controller);
        },
    });
    const newResponse = createFromReadableStream(readable, {
        callServer,
    });
    rscCache.set(cacheKey, newResponse);
    return newResponse;
}
function ServerRoot({ cacheKey }) {
    React.useEffect(() => {
        rscCache.delete(cacheKey);
    });
    const response = useInitialServerResponse(cacheKey);
    const root = use(response);
    return root;
}
const StrictModeIfEnabled = process.env.__NEXT_STRICT_MODE_APP
    ? React.StrictMode
    : React.Fragment;
function Root({ children }) {
    if (process.env.__NEXT_ANALYTICS_ID) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useEffect(() => {
            require('./performance-relayer-app')();
        }, []);
    }
    if (process.env.__NEXT_TEST_MODE) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useEffect(() => {
            window.__NEXT_HYDRATED = true;
            if (window.__NEXT_HYDRATED_CB) {
                window.__NEXT_HYDRATED_CB();
            }
        }, []);
    }
    return children;
}
function RSCComponent(props) {
    return _jsx(ServerRoot, Object.assign({}, props, { cacheKey: getCacheKey() }));
}
export function hydrate() {
    if (process.env.NODE_ENV !== 'production') {
        const rootLayoutMissingTagsError = self
            .__next_root_layout_missing_tags_error;
        const HotReload = require('./components/react-dev-overlay/hot-reloader-client')
            .default;
        // Don't try to hydrate if root layout is missing required tags, render error instead
        if (rootLayoutMissingTagsError) {
            const reactRootElement = document.createElement('div');
            document.body.appendChild(reactRootElement);
            const reactRoot = ReactDOMClient.createRoot(reactRootElement, {
                onRecoverableError,
            });
            reactRoot.render(_jsx(GlobalLayoutRouterContext.Provider, { value: {
                    buildId: 'development',
                    tree: rootLayoutMissingTagsError.tree,
                    changeByServerResponse: () => { },
                    focusAndScrollRef: {
                        apply: false,
                        onlyHashChange: false,
                        hashFragment: null,
                        segmentPaths: [],
                    },
                    nextUrl: null,
                }, children: _jsx(HotReload, { assetPrefix: rootLayoutMissingTagsError.assetPrefix }) }));
            return;
        }
    }
    const actionQueue = createMutableActionQueue();
    const reactEl = (_jsx(StrictModeIfEnabled, { children: _jsx(HeadManagerContext.Provider, { value: {
                appDir: true,
            }, children: _jsx(ActionQueueContext.Provider, { value: actionQueue, children: _jsx(Root, { children: _jsx(RSCComponent, {}) }) }) }) }));
    const options = {
        onRecoverableError,
    };
    const isError = document.documentElement.id === '__next_error__';
    if (process.env.NODE_ENV !== 'production') {
        // Patch console.error to collect information about hydration errors
        const patchConsoleError = require('./components/react-dev-overlay/internal/helpers/hydration-error-info')
            .patchConsoleError;
        if (!isError) {
            patchConsoleError();
        }
    }
    if (isError) {
        if (process.env.NODE_ENV !== 'production') {
            // if an error is thrown while rendering an RSC stream, this will catch it in dev
            // and show the error overlay
            const ReactDevOverlay = require('./components/react-dev-overlay/internal/ReactDevOverlay')
                .default;
            const INITIAL_OVERLAY_STATE = require('./components/react-dev-overlay/internal/error-overlay-reducer').INITIAL_OVERLAY_STATE;
            const getSocketUrl = require('./components/react-dev-overlay/internal/helpers/get-socket-url')
                .getSocketUrl;
            let errorTree = (_jsx(ReactDevOverlay, { state: INITIAL_OVERLAY_STATE, onReactError: () => { }, children: reactEl }));
            const socketUrl = getSocketUrl(process.env.__NEXT_ASSET_PREFIX || '');
            const socket = new window.WebSocket(`${socketUrl}/_next/webpack-hmr`);
            // add minimal "hot reload" support for RSC errors
            const handler = (event) => {
                let obj;
                try {
                    obj = JSON.parse(event.data);
                }
                catch (_a) { }
                if (!obj || !('action' in obj)) {
                    return;
                }
                if (obj.action === 'serverComponentChanges') {
                    window.location.reload();
                }
            };
            socket.addEventListener('message', handler);
            ReactDOMClient.createRoot(appElement, options).render(errorTree);
        }
        else {
            ReactDOMClient.createRoot(appElement, options).render(reactEl);
        }
    }
    else {
        React.startTransition(() => ReactDOMClient.hydrateRoot(appElement, reactEl, Object.assign(Object.assign({}, options), { formState: initialFormStateData })));
    }
    // TODO-APP: Remove this logic when Float has GC built-in in development.
    if (process.env.NODE_ENV !== 'production') {
        const { linkGc } = require('./app-link-gc');
        linkGc();
    }
}
