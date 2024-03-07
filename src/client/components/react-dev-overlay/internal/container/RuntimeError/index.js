import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { CodeFrame } from '../../components/CodeFrame';
import { noop as css } from '../../helpers/noop-template';
import { groupStackFramesByFramework } from '../../helpers/group-stack-frames-by-framework';
import { CallStackFrame } from './CallStackFrame';
import { GroupedStackFrames } from './GroupedStackFrames';
import { ComponentStackFrameRow } from './ComponentStackFrameRow';
const RuntimeError = function RuntimeError({ error, }) {
    const firstFirstPartyFrameIndex = React.useMemo(() => {
        return error.frames.findIndex((entry) => entry.expanded &&
            Boolean(entry.originalCodeFrame) &&
            Boolean(entry.originalStackFrame));
    }, [error.frames]);
    const firstFrame = React.useMemo(() => {
        var _a;
        return (_a = error.frames[firstFirstPartyFrameIndex]) !== null && _a !== void 0 ? _a : null;
    }, [error.frames, firstFirstPartyFrameIndex]);
    const allLeadingFrames = React.useMemo(() => firstFirstPartyFrameIndex < 0
        ? []
        : error.frames.slice(0, firstFirstPartyFrameIndex), [error.frames, firstFirstPartyFrameIndex]);
    const [all, setAll] = React.useState(firstFrame == null);
    const toggleAll = React.useCallback(() => {
        setAll((v) => !v);
    }, []);
    const leadingFrames = React.useMemo(() => allLeadingFrames.filter((f) => f.expanded || all), [all, allLeadingFrames]);
    const allCallStackFrames = React.useMemo(() => error.frames.slice(firstFirstPartyFrameIndex + 1), [error.frames, firstFirstPartyFrameIndex]);
    const visibleCallStackFrames = React.useMemo(() => allCallStackFrames.filter((f) => f.expanded || all), [all, allCallStackFrames]);
    const canShowMore = React.useMemo(() => {
        return (allCallStackFrames.length !== visibleCallStackFrames.length ||
            (all && firstFrame != null));
    }, [
        all,
        allCallStackFrames.length,
        firstFrame,
        visibleCallStackFrames.length,
    ]);
    const stackFramesGroupedByFramework = React.useMemo(() => groupStackFramesByFramework(visibleCallStackFrames), [visibleCallStackFrames]);
    return (_jsxs(React.Fragment, { children: [firstFrame ? (_jsxs(React.Fragment, { children: [_jsx("h2", { children: "Source" }), leadingFrames.map((frame, index) => (_jsx(CallStackFrame, { frame: frame }, `leading-frame-${index}-${all}`))), _jsx(CodeFrame, { stackFrame: firstFrame.originalStackFrame, codeFrame: firstFrame.originalCodeFrame })] })) : undefined, error.componentStackFrames ? (_jsxs(_Fragment, { children: [_jsx("h2", { children: "Component Stack" }), error.componentStackFrames.map((componentStackFrame, index) => (_jsx(ComponentStackFrameRow, { componentStackFrame: componentStackFrame }, index)))] })) : null, stackFramesGroupedByFramework.length ? (_jsxs(React.Fragment, { children: [_jsx("h2", { children: "Call Stack" }), _jsx(GroupedStackFrames, { groupedStackFrames: stackFramesGroupedByFramework, all: all })] })) : undefined, canShowMore ? (_jsx(React.Fragment, { children: _jsxs("button", { tabIndex: 10, "data-nextjs-data-runtime-error-collapsed-action": true, type: "button", onClick: toggleAll, children: [all ? 'Hide' : 'Show', " collapsed frames"] }) })) : undefined] }));
};
export const styles = css `
  button[data-nextjs-data-runtime-error-collapsed-action] {
    background: none;
    border: none;
    padding: 0;
    font-size: var(--size-font-small);
    line-height: var(--size-font-bigger);
    color: var(--color-accents-3);
  }

  [data-nextjs-call-stack-frame]:not(:last-child),
  [data-nextjs-component-stack-frame]:not(:last-child) {
    margin-bottom: var(--size-gap-double);
  }

  [data-nextjs-call-stack-frame] > h3,
  [data-nextjs-component-stack-frame] > h3 {
    margin-top: 0;
    margin-bottom: var(--size-gap);
    font-family: var(--font-stack-monospace);
    font-size: var(--size-font);
    color: #222;
  }
  [data-nextjs-call-stack-frame] > h3[data-nextjs-frame-expanded='false'] {
    color: #666;
  }
  [data-nextjs-call-stack-frame] > div,
  [data-nextjs-component-stack-frame] > div {
    display: flex;
    align-items: center;
    padding-left: calc(var(--size-gap) + var(--size-gap-half));
    font-size: var(--size-font-small);
    color: #999;
  }
  [data-nextjs-call-stack-frame] > div > svg,
  [data-nextjs-component-stack-frame] > [role='link'] > svg {
    width: auto;
    height: var(--size-font-small);
    margin-left: var(--size-gap);
    flex-shrink: 0;

    display: none;
  }

  [data-nextjs-call-stack-frame] > div[data-has-source],
  [data-nextjs-component-stack-frame] > [role='link'] {
    cursor: pointer;
  }
  [data-nextjs-call-stack-frame] > div[data-has-source]:hover,
  [data-nextjs-component-stack-frame] > [role='link']:hover {
    text-decoration: underline dotted;
  }
  [data-nextjs-call-stack-frame] > div[data-has-source] > svg,
  [data-nextjs-component-stack-frame] > [role='link'] > svg {
    display: unset;
  }

  [data-nextjs-call-stack-framework-icon] {
    margin-right: var(--size-gap);
  }
  [data-nextjs-call-stack-framework-icon='next'] > mask {
    mask-type: alpha;
  }
  [data-nextjs-call-stack-framework-icon='react'] {
    color: rgb(20, 158, 202);
  }
  [data-nextjs-collapsed-call-stack-details][open]
    [data-nextjs-call-stack-chevron-icon] {
    transform: rotate(90deg);
  }
  [data-nextjs-collapsed-call-stack-details] summary {
    display: flex;
    align-items: center;
    margin: var(--size-gap-double) 0;
    list-style: none;
  }
  [data-nextjs-collapsed-call-stack-details] summary::-webkit-details-marker {
    display: none;
  }

  [data-nextjs-collapsed-call-stack-details] h3 {
    color: #666;
  }
  [data-nextjs-collapsed-call-stack-details] [data-nextjs-call-stack-frame] {
    margin-bottom: var(--size-gap-double);
  }
`;
export { RuntimeError };
