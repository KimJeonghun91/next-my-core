import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { useOpenInEditor } from '../../helpers/use-open-in-editor';
function EditorLink({ children, componentStackFrame: { file, column, lineNumber }, }) {
    const open = useOpenInEditor({
        file,
        column,
        lineNumber,
    });
    return (_jsxs("div", { tabIndex: 10, role: 'link', onClick: open, title: 'Click to open in your editor', children: [children, _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }), _jsx("polyline", { points: "15 3 21 3 21 9" }), _jsx("line", { x1: "10", y1: "14", x2: "21", y2: "3" })] })] }));
}
function formatLineNumber(lineNumber, column) {
    if (!column) {
        return lineNumber;
    }
    return `${lineNumber}:${column}`;
}
function LocationLine({ componentStackFrame, }) {
    const { file, lineNumber, column } = componentStackFrame;
    return (_jsxs(_Fragment, { children: [file, " ", lineNumber ? `(${formatLineNumber(lineNumber, column)})` : ''] }));
}
function SourceLocation({ componentStackFrame, }) {
    const { file, canOpenInEditor } = componentStackFrame;
    if (file && canOpenInEditor) {
        return (_jsx(EditorLink, { componentStackFrame: componentStackFrame, children: _jsx("span", { children: _jsx(LocationLine, { componentStackFrame: componentStackFrame }) }) }));
    }
    return (_jsx("div", { children: _jsx(LocationLine, { componentStackFrame: componentStackFrame }) }));
}
export function ComponentStackFrameRow({ componentStackFrame, }) {
    const { component } = componentStackFrame;
    return (_jsxs("div", { "data-nextjs-component-stack-frame": true, children: [_jsx("h3", { children: component }), _jsx(SourceLocation, { componentStackFrame: componentStackFrame })] }));
}
