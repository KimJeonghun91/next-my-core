import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Dialog, DialogBody, DialogContent, DialogHeader, } from '../components/Dialog';
import { Overlay } from '../components/Overlay';
import { Terminal } from '../components/Terminal';
import { VersionStalenessInfo } from '../components/VersionStalenessInfo';
import { noop as css } from '../helpers/noop-template';
export const BuildError = function BuildError({ message, versionInfo, }) {
    const noop = React.useCallback(() => { }, []);
    return (_jsx(Overlay, { fixed: true, children: _jsx(Dialog, { type: "error", "aria-labelledby": "nextjs__container_build_error_label", "aria-describedby": "nextjs__container_build_error_desc", onClose: noop, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { className: "nextjs-container-build-error-header", children: [_jsx("h4", { id: "nextjs__container_build_error_label", children: "Failed to compile" }), versionInfo ? _jsx(VersionStalenessInfo, Object.assign({}, versionInfo)) : null] }), _jsxs(DialogBody, { className: "nextjs-container-build-error-body", children: [_jsx(Terminal, { content: message }), _jsx("footer", { children: _jsx("p", { id: "nextjs__container_build_error_desc", children: _jsx("small", { children: "This error occurred during the build process and can only be dismissed by fixing the error." }) }) })] })] }) }) }));
};
export const styles = css `
  .nextjs-container-build-error-header {
    display: flex;
    align-items: center;
  }
  .nextjs-container-build-error-header > h4 {
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }

  .nextjs-container-build-error-body footer {
    margin-top: var(--size-gap);
  }
  .nextjs-container-build-error-body footer p {
    margin: 0;
  }

  .nextjs-container-build-error-body small {
    color: #757575;
  }
`;
