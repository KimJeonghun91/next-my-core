import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Dialog, DialogBody, DialogContent, DialogHeader, } from '../components/Dialog';
import { Overlay } from '../components/Overlay';
import { Terminal } from '../components/Terminal';
import { noop as css } from '../helpers/noop-template';
export const RootLayoutError = function BuildError({ missingTags }) {
    const message = 'Please make sure to include the following tags in your root layout: <html>, <body>.\n\n' +
        `Missing required root layout tag${missingTags.length === 1 ? '' : 's'}: ` +
        missingTags.join(', ');
    const noop = React.useCallback(() => { }, []);
    return (_jsx(Overlay, { fixed: true, children: _jsx(Dialog, { type: "error", "aria-labelledby": "nextjs__container_root_layout_error_label", "aria-describedby": "nextjs__container_root_layout_error_desc", onClose: noop, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { className: "nextjs-container-root-layout-error-header", children: _jsx("h4", { id: "nextjs__container_root_layout_error_label", children: "Missing required tags" }) }), _jsxs(DialogBody, { className: "nextjs-container-root-layout-error-body", children: [_jsx(Terminal, { content: message }), _jsx("footer", { children: _jsx("p", { id: "nextjs__container_root_layout_error_desc", children: _jsx("small", { children: "This error and can only be dismissed by providing all required tags." }) }) })] })] }) }) }));
};
export const styles = css `
  .nextjs-container-root-layout-error-header > h4 {
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }

  .nextjs-container-root-layout-error-body footer {
    margin-top: var(--size-gap);
  }
  .nextjs-container-root-layout-error-body footer p {
    margin: 0;
  }

  .nextjs-container-root-layout-error-body small {
    color: #757575;
  }
`;
