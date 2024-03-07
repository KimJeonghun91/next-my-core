import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useOpenInEditor } from '../../helpers/use-open-in-editor';
export function EditorLink({ file, isSourceFile, location }) {
    var _a, _b;
    const open = useOpenInEditor({
        file,
        lineNumber: (_a = location === null || location === void 0 ? void 0 : location.line) !== null && _a !== void 0 ? _a : 1,
        column: (_b = location === null || location === void 0 ? void 0 : location.column) !== null && _b !== void 0 ? _b : 0,
    });
    return (_jsxs("div", { "data-with-open-in-editor-link": true, "data-with-open-in-editor-link-source-file": isSourceFile ? true : undefined, "data-with-open-in-editor-link-import-trace": isSourceFile ? undefined : true, tabIndex: 10, role: 'link', onClick: open, title: 'Click to open in your editor', children: [file, location ? `:${location.line}:${location.column}` : null, _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }), _jsx("polyline", { points: "15 3 21 3 21 9" }), _jsx("line", { x1: "10", y1: "14", x2: "21", y2: "3" })] })] }));
}
