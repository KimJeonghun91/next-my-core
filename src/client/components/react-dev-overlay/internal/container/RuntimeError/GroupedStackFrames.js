import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CallStackFrame } from './CallStackFrame';
import { FrameworkIcon } from './FrameworkIcon';
function FrameworkGroup({ framework, stackFrames, all, }) {
    return (_jsx(_Fragment, { children: _jsxs("details", { "data-nextjs-collapsed-call-stack-details": true, children: [_jsxs("summary", { tabIndex: 10, children: [_jsx("svg", { "data-nextjs-call-stack-chevron-icon": true, fill: "none", height: "20", width: "20", shapeRendering: "geometricPrecision", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", viewBox: "0 0 24 24", children: _jsx("path", { d: "M9 18l6-6-6-6" }) }), _jsx(FrameworkIcon, { framework: framework }), framework === 'react' ? 'React' : 'Next.js'] }), stackFrames.map((frame, index) => (_jsx(CallStackFrame, { frame: frame }, `call-stack-${index}-${all}`)))] }) }));
}
export function GroupedStackFrames({ groupedStackFrames, all, }) {
    return (_jsx(_Fragment, { children: groupedStackFrames.map((stackFramesGroup, groupIndex) => {
            // Collapse React and Next.js frames
            if (stackFramesGroup.framework) {
                return (_jsx(FrameworkGroup, { framework: stackFramesGroup.framework, stackFrames: stackFramesGroup.stackFrames, all: all }, `call-stack-framework-group-${groupIndex}-${all}`));
            }
            return (
            // Don't group non React and Next.js frames
            stackFramesGroup.stackFrames.map((frame, frameIndex) => (_jsx(CallStackFrame, { frame: frame }, `call-stack-${groupIndex}-${frameIndex}-${all}`))));
        }) }));
}
