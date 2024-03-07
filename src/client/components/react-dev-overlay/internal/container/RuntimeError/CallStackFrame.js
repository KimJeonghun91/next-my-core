import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { getFrameSource, } from '../../helpers/stack-frame';
import { useOpenInEditor } from '../../helpers/use-open-in-editor';
export const CallStackFrame = function CallStackFrame({ frame }) {
    // TODO: ability to expand resolved frames
    // TODO: render error or external indicator
    var _a;
    const f = (_a = frame.originalStackFrame) !== null && _a !== void 0 ? _a : frame.sourceStackFrame;
    const hasSource = Boolean(frame.originalCodeFrame);
    const open = useOpenInEditor(hasSource
        ? {
            file: f.file,
            lineNumber: f.lineNumber,
            column: f.column,
        }
        : undefined);
    return (_jsxs("div", { "data-nextjs-call-stack-frame": true, children: [_jsx("h3", { "data-nextjs-frame-expanded": Boolean(frame.expanded), children: f.methodName }), _jsxs("div", { "data-has-source": hasSource ? 'true' : undefined, tabIndex: hasSource ? 10 : undefined, role: hasSource ? 'link' : undefined, onClick: open, title: hasSource ? 'Click to open in your editor' : undefined, children: [_jsx("span", { children: getFrameSource(f) }), _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }), _jsx("polyline", { points: "15 3 21 3 21 9" }), _jsx("line", { x1: "10", y1: "14", x2: "21", y2: "3" })] })] })] }));
};
