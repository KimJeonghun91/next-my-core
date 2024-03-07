import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useReducer, useMemo, startTransition } from "react";
import stripAnsi from "next/dist/compiled/strip-ansi";
import formatWebpackMessages from "../../dev/error-overlay/format-webpack-messages";
import { useRouter } from "../navigation";
import { ACTION_VERSION_INFO, INITIAL_OVERLAY_STATE, errorOverlayReducer } from "./internal/error-overlay-reducer";
import { ACTION_BUILD_OK, ACTION_BUILD_ERROR, ACTION_BEFORE_REFRESH, ACTION_REFRESH, ACTION_UNHANDLED_ERROR, ACTION_UNHANDLED_REJECTION } from "./internal/error-overlay-reducer";
import { parseStack } from "./internal/helpers/parseStack";
import ReactDevOverlay from "./internal/ReactDevOverlay";
import { RuntimeErrorHandler, useErrorHandler } from "./internal/helpers/use-error-handler";
import { useSendMessage, useTurbopack, useWebsocket, useWebsocketPing } from "./internal/helpers/use-websocket";
import { parseComponentStack } from "./internal/helpers/parse-component-stack";
import { HMR_ACTIONS_SENT_TO_BROWSER } from "../../../server/dev/hot-reloader-types";
let mostRecentCompilationHash = null;
let __nextDevClientId = Math.round(Math.random() * 100 + Date.now());
let reloading = false;
let startLatency = null;
function onBeforeFastRefresh(dispatcher, hasUpdates) {
    if (hasUpdates) {
        dispatcher.onBeforeRefresh();
    }
}
function onFastRefresh(dispatcher, sendMessage, updatedModules) {
    let endLatency = Date.now();
    dispatcher.onBuildOk();
    sendMessage(JSON.stringify({
        event: "client-hmr-latency",
        id: window.__nextDevClientId,
        startTime: startLatency,
        endTime: endLatency,
        page: window.location.pathname,
        updatedModules,
        // Whether the page (tab) was hidden at the time the event occurred.
        // This can impact the accuracy of the event's timing.
        isPageHidden: document.visibilityState === "hidden"
    }));
    if (updatedModules.length > 0) {
        dispatcher.onRefresh();
    }
}
// There is a newer version of the code available.
function handleAvailableHash(hash) {
    // Update last known compilation hash.
    mostRecentCompilationHash = hash;
}
/**
 * Is there a newer version of this code available?
 * For webpack: Check if the hash changed compared to __webpack_hash__
 * For Turbopack: Always true because it doesn't have __webpack_hash__
 */ function isUpdateAvailable() {
    if (process.env.TURBOPACK) {
        return true;
    }
    /* globals __webpack_hash__ */ // __webpack_hash__ is the hash of the current compilation.
    // It's a global variable injected by Webpack.
    return mostRecentCompilationHash !== __webpack_hash__;
}
// Webpack disallows updates in other states.
function canApplyUpdates() {
    // @ts-expect-error module.hot exists
    return module.hot.status() === "idle";
}
function afterApplyUpdates(fn) {
    if (canApplyUpdates()) {
        fn();
    } else {
        function handler(status) {
            if (status === "idle") {
                // @ts-expect-error module.hot exists
                module.hot.removeStatusHandler(handler);
                fn();
            }
        }
        // @ts-expect-error module.hot exists
        module.hot.addStatusHandler(handler);
    }
}
function performFullReload(err, sendMessage) {
    const stackTrace = err && (err.stack && err.stack.split("\n").slice(0, 5).join("\n") || err.message || err + "");
    sendMessage(JSON.stringify({
        event: "client-full-reload",
        stackTrace,
        hadRuntimeError: !!RuntimeErrorHandler.hadRuntimeError
    }));
    if (reloading) return;
    reloading = true;
    window.location.reload();
}
// Attempt to update code on the fly, fall back to a hard reload.
function tryApplyUpdates(onBeforeUpdate, onHotUpdateSuccess, sendMessage, dispatcher) {
    if (!isUpdateAvailable() || !canApplyUpdates()) {
        dispatcher.onBuildOk();
        return;
    }
    function handleApplyUpdates(err, updatedModules) {
        if (err || RuntimeErrorHandler.hadRuntimeError || !updatedModules) {
            if (err) {
                console.warn("[Fast Refresh] performing full reload\n\n" + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + "You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n" + "Consider migrating the non-React component export to a separate file and importing it into both files.\n\n" + "It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n" + "Fast Refresh requires at least one parent function component in your React tree.");
            } else if (RuntimeErrorHandler.hadRuntimeError) {
                console.warn("[Fast Refresh] performing full reload because your application had an unrecoverable error");
            }
            performFullReload(err, sendMessage);
            return;
        }
        const hasUpdates = Boolean(updatedModules.length);
        if (typeof onHotUpdateSuccess === "function") {
            // Maybe we want to do something.
            onHotUpdateSuccess(updatedModules);
        }
        if (isUpdateAvailable()) {
            // While we were updating, there was a new update! Do it again.
            tryApplyUpdates(hasUpdates ? ()=>{} : onBeforeUpdate, hasUpdates ? ()=>dispatcher.onBuildOk() : onHotUpdateSuccess, sendMessage, dispatcher);
        } else {
            dispatcher.onBuildOk();
            if (process.env.__NEXT_TEST_MODE) {
                afterApplyUpdates(()=>{
                    if (self.__NEXT_HMR_CB) {
                        self.__NEXT_HMR_CB();
                        self.__NEXT_HMR_CB = null;
                    }
                });
            }
        }
    }
    // https://webpack.js.org/api/hot-module-replacement/#check
    // @ts-expect-error module.hot exists
    module.hot.check(/* autoApply */ false).then((updatedModules)=>{
        if (!updatedModules) {
            return null;
        }
        if (typeof onBeforeUpdate === "function") {
            const hasUpdates = Boolean(updatedModules.length);
            onBeforeUpdate(hasUpdates);
        }
        // https://webpack.js.org/api/hot-module-replacement/#apply
        // @ts-expect-error module.hot exists
        return module.hot.apply();
    }).then((updatedModules)=>{
        handleApplyUpdates(null, updatedModules);
    }, (err)=>{
        handleApplyUpdates(err, null);
    });
}
function processMessage(obj, sendMessage, router, dispatcher) {
    if (!("action" in obj)) {
        return;
    }
    function handleErrors(errors) {
        // "Massage" webpack messages.
        const formatted = formatWebpackMessages({
            errors: errors,
            warnings: []
        });
        // Only show the first error.
        dispatcher.onBuildError(formatted.errors[0]);
        // Also log them to the console.
        for(let i = 0; i < formatted.errors.length; i++){
            console.error(stripAnsi(formatted.errors[i]));
        }
        // Do not attempt to reload now.
        // We will reload on next success instead.
        if (process.env.__NEXT_TEST_MODE) {
            if (self.__NEXT_HMR_CB) {
                self.__NEXT_HMR_CB(formatted.errors[0]);
                self.__NEXT_HMR_CB = null;
            }
        }
    }
    function handleHotUpdate(updatedModules) {
        if (process.env.TURBOPACK) {
            onFastRefresh(dispatcher, sendMessage, updatedModules || []);
        } else {
            tryApplyUpdates(function onBeforeHotUpdate(hasUpdates) {
                onBeforeFastRefresh(dispatcher, hasUpdates);
            }, function onSuccessfulHotUpdate(webpackUpdatedModules) {
                // Only dismiss it when we're sure it's a hot update.
                // Otherwise it would flicker right before the reload.
                onFastRefresh(dispatcher, sendMessage, webpackUpdatedModules);
            }, sendMessage, dispatcher);
        }
    }
    switch(obj.action){
        case HMR_ACTIONS_SENT_TO_BROWSER.BUILDING:
            {
                startLatency = Date.now();
                console.log("[Fast Refresh] rebuilding");
                break;
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.FINISH_BUILDING:
            {
                break;
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.BUILT:
        case HMR_ACTIONS_SENT_TO_BROWSER.SYNC:
            {
                if (obj.hash) {
                    handleAvailableHash(obj.hash);
                }
                const { errors, warnings } = obj;
                // Is undefined when it's a 'built' event
                if ("versionInfo" in obj) {
                    dispatcher.onVersionInfo(obj.versionInfo);
                }
                const hasErrors = Boolean(errors && errors.length);
                // Compilation with errors (e.g. syntax error or missing modules).
                if (hasErrors) {
                    sendMessage(JSON.stringify({
                        event: "client-error",
                        errorCount: errors.length,
                        clientId: __nextDevClientId
                    }));
                    handleErrors(errors);
                    return;
                }
                const hasWarnings = Boolean(warnings && warnings.length);
                if (hasWarnings) {
                    sendMessage(JSON.stringify({
                        event: "client-warning",
                        warningCount: warnings.length,
                        clientId: __nextDevClientId
                    }));
                    // Print warnings to the console.
                    const formattedMessages = formatWebpackMessages({
                        warnings: warnings,
                        errors: []
                    });
                    for(let i = 0; i < formattedMessages.warnings.length; i++){
                        if (i === 5) {
                            console.warn("There were more warnings in other files.\n" + "You can find a complete log in the terminal.");
                            break;
                        }
                        console.warn(stripAnsi(formattedMessages.warnings[i]));
                    }
                // No early return here as we need to apply modules in the same way between warnings only and compiles without warnings
                }
                sendMessage(JSON.stringify({
                    event: "client-success",
                    clientId: __nextDevClientId
                }));
                if (obj.action === HMR_ACTIONS_SENT_TO_BROWSER.BUILT) {
                    // Handle hot updates
                    handleHotUpdate(obj.updatedModules);
                }
                return;
            }
        // TODO-APP: make server component change more granular
        case HMR_ACTIONS_SENT_TO_BROWSER.SERVER_COMPONENT_CHANGES:
            {
                sendMessage(JSON.stringify({
                    event: "server-component-reload-page",
                    clientId: __nextDevClientId
                }));
                if (RuntimeErrorHandler.hadRuntimeError) {
                    if (reloading) return;
                    reloading = true;
                    return window.location.reload();
                }
                startTransition(()=>{
                    // @ts-ignore it exists, it's just hidden
                    router.fastRefresh();
                    dispatcher.onRefresh();
                });
                if (process.env.__NEXT_TEST_MODE) {
                    if (self.__NEXT_HMR_CB) {
                        self.__NEXT_HMR_CB();
                        self.__NEXT_HMR_CB = null;
                    }
                }
                return;
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.RELOAD_PAGE:
            {
                sendMessage(JSON.stringify({
                    event: "client-reload-page",
                    clientId: __nextDevClientId
                }));
                if (reloading) return;
                reloading = true;
                return window.location.reload();
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.REMOVED_PAGE:
            {
                // TODO-APP: potentially only refresh if the currently viewed page was removed.
                // @ts-ignore it exists, it's just hidden
                router.fastRefresh();
                return;
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.ADDED_PAGE:
            {
                // TODO-APP: potentially only refresh if the currently viewed page was added.
                // @ts-ignore it exists, it's just hidden
                router.fastRefresh();
                return;
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.SERVER_ERROR:
            {
                const { errorJSON } = obj;
                if (errorJSON) {
                    const { message, stack } = JSON.parse(errorJSON);
                    const error = new Error(message);
                    error.stack = stack;
                    handleErrors([
                        error
                    ]);
                }
                return;
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.DEV_PAGES_MANIFEST_UPDATE:
            {
                return;
            }
        default:
            {}
    }
}
export default function HotReload(param) {
    let { assetPrefix, children } = param;
    const [state, dispatch] = useReducer(errorOverlayReducer, INITIAL_OVERLAY_STATE);
    const dispatcher = useMemo(()=>{
        return {
            onBuildOk () {
                dispatch({
                    type: ACTION_BUILD_OK
                });
            },
            onBuildError (message) {
                dispatch({
                    type: ACTION_BUILD_ERROR,
                    message
                });
            },
            onBeforeRefresh () {
                dispatch({
                    type: ACTION_BEFORE_REFRESH
                });
            },
            onRefresh () {
                dispatch({
                    type: ACTION_REFRESH
                });
            },
            onVersionInfo (versionInfo) {
                dispatch({
                    type: ACTION_VERSION_INFO,
                    versionInfo
                });
            }
        };
    }, [
        dispatch
    ]);
    const handleOnUnhandledError = useCallback((error)=>{
        // Component stack is added to the error in use-error-handler in case there was a hydration errror
        const componentStack = error._componentStack;
        dispatch({
            type: ACTION_UNHANDLED_ERROR,
            reason: error,
            frames: parseStack(error.stack),
            componentStackFrames: componentStack && parseComponentStack(componentStack)
        });
    }, []);
    const handleOnUnhandledRejection = useCallback((reason)=>{
        dispatch({
            type: ACTION_UNHANDLED_REJECTION,
            reason: reason,
            frames: parseStack(reason.stack)
        });
    }, []);
    const handleOnReactError = useCallback(()=>{
        RuntimeErrorHandler.hadRuntimeError = true;
    }, []);
    useErrorHandler(handleOnUnhandledError, handleOnUnhandledRejection);
    const webSocketRef = useWebsocket(assetPrefix);
    useWebsocketPing(webSocketRef);
    const sendMessage = useSendMessage(webSocketRef);
    const processTurbopackMessage = useTurbopack(sendMessage);
    const router = useRouter();
    useEffect(()=>{
        const handler = (event)=>{
            try {
                const obj = JSON.parse(event.data);
                const handledByTurbopack = processTurbopackMessage == null ? void 0 : processTurbopackMessage(obj);
                if (!handledByTurbopack) {
                    processMessage(obj, sendMessage, router, dispatcher);
                }
            } catch (err) {
                var _err_stack;
                console.warn("[HMR] Invalid message: " + event.data + "\n" + ((_err_stack = err == null ? void 0 : err.stack) != null ? _err_stack : ""));
            }
        };
        const websocket = webSocketRef.current;
        if (websocket) {
            websocket.addEventListener("message", handler);
        }
        return ()=>websocket && websocket.removeEventListener("message", handler);
    }, [
        sendMessage,
        router,
        webSocketRef,
        dispatcher,
        processTurbopackMessage
    ]);
    return /*#__PURE__*/ _jsx(ReactDevOverlay, {
        onReactError: handleOnReactError,
        state: state,
        children: children
    });
}

//# sourceMappingURL=hot-reloader-client.js.map