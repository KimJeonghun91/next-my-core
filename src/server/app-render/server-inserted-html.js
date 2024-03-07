import { jsx as _jsx } from "react/jsx-runtime";
// Provider for the `useServerInsertedHTML` API to register callbacks to insert
// elements into the HTML stream.
import React from 'react';
import { ServerInsertedHTMLContext } from '../../shared/lib/server-inserted-html.shared-runtime';
export function createServerInsertedHTML() {
    const serverInsertedHTMLCallbacks = [];
    const addInsertedHtml = (handler) => {
        serverInsertedHTMLCallbacks.push(handler);
    };
    return {
        ServerInsertedHTMLProvider({ children }) {
            return (_jsx(ServerInsertedHTMLContext.Provider, { value: addInsertedHtml, children: children }));
        },
        renderServerInsertedHTML() {
            return serverInsertedHTMLCallbacks.map((callback, index) => (_jsx(React.Fragment, { children: callback() }, '__next_server_inserted__' + index)));
        },
    };
}
