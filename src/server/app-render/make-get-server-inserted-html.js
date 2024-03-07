import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { isNotFoundError } from '../../client/components/not-found';
import { getURLFromRedirectError, isRedirectError, getRedirectStatusCodeFromError, } from '../../client/components/redirect';
import { renderToReadableStream } from 'react-dom/server.edge';
import { streamToString } from '../stream-utils/node-web-streams-helper';
import { RedirectStatusCode } from '../../client/components/redirect-status-code';
import { addPathPrefix } from '../../shared/lib/router/utils/add-path-prefix';
export function makeGetServerInsertedHTML({ polyfills, renderServerInsertedHTML, basePath, hasPostponed, }) {
    let flushedErrorMetaTagsUntilIndex = 0;
    // If the render had postponed, then we have already flushed the polyfills.
    let polyfillsFlushed = hasPostponed;
    return async function getServerInsertedHTML(serverCapturedErrors) {
        // Loop through all the errors that have been captured but not yet
        // flushed.
        const errorMetaTags = [];
        while (flushedErrorMetaTagsUntilIndex < serverCapturedErrors.length) {
            const error = serverCapturedErrors[flushedErrorMetaTagsUntilIndex];
            flushedErrorMetaTagsUntilIndex++;
            if (isNotFoundError(error)) {
                errorMetaTags.push(_jsx("meta", { name: "robots", content: "noindex" }, error.digest), process.env.NODE_ENV === 'development' ? (_jsx("meta", { name: "next-error", content: "not-found" }, "next-error")) : null);
            }
            else if (isRedirectError(error)) {
                const redirectUrl = addPathPrefix(getURLFromRedirectError(error), basePath);
                const statusCode = getRedirectStatusCodeFromError(error);
                const isPermanent = statusCode === RedirectStatusCode.PermanentRedirect ? true : false;
                if (redirectUrl) {
                    errorMetaTags.push(_jsx("meta", { httpEquiv: "refresh", content: `${isPermanent ? 0 : 1};url=${redirectUrl}` }, error.digest));
                }
            }
        }
        const stream = await renderToReadableStream(_jsxs(_Fragment, { children: [!polyfillsFlushed &&
                    (polyfills === null || polyfills === void 0 ? void 0 : polyfills.map((polyfill) => {
                        return _jsx("script", Object.assign({}, polyfill), polyfill.src);
                    })), renderServerInsertedHTML(), errorMetaTags] }));
        // Mark polyfills as flushed so they don't get flushed again.
        if (!polyfillsFlushed)
            polyfillsFlushed = true;
        // Wait for the stream to be ready.
        await stream.allReady;
        return streamToString(stream);
    };
}
