import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
export default function DefaultLayout({ children, }) {
    return (_jsx("html", { children: _jsx("body", { children: children }) }));
}
