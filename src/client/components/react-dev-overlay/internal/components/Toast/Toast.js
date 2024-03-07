import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
export const Toast = function Toast({ onClick, children, className, }) {
    return (_jsx("div", { "data-nextjs-toast": true, onClick: onClick, className: className, children: _jsx("div", { "data-nextjs-toast-wrapper": true, children: children }) }));
};
