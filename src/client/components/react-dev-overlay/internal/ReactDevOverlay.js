import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { ACTION_UNHANDLED_ERROR } from './error-overlay-reducer';
import { ShadowPortal } from './components/ShadowPortal';
import { BuildError } from './container/BuildError';
import { Errors } from './container/Errors';
import { RootLayoutError } from './container/RootLayoutError';
import { parseStack } from './helpers/parseStack';
import { Base } from './styles/Base';
import { ComponentStyles } from './styles/ComponentStyles';
import { CssReset } from './styles/CssReset';
class ReactDevOverlay extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { reactError: null };
    }
    static getDerivedStateFromError(error) {
        const e = error;
        const event = {
            type: ACTION_UNHANDLED_ERROR,
            reason: error,
            frames: parseStack(e.stack),
        };
        const errorEvent = {
            id: 0,
            event,
        };
        return { reactError: errorEvent };
    }
    componentDidCatch(componentErr) {
        this.props.onReactError(componentErr);
    }
    render() {
        const { state, children } = this.props;
        const { reactError } = this.state;
        const hasBuildError = state.buildError != null;
        const hasRuntimeErrors = Boolean(state.errors.length);
        const rootLayoutMissingTagsError = state.rootLayoutMissingTagsError;
        const isMounted = hasBuildError ||
            hasRuntimeErrors ||
            reactError ||
            rootLayoutMissingTagsError;
        return (_jsxs(_Fragment, { children: [reactError ? (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", {})] })) : (children), isMounted ? (_jsxs(ShadowPortal, { children: [_jsx(CssReset, {}), _jsx(Base, {}), _jsx(ComponentStyles, {}), rootLayoutMissingTagsError ? (_jsx(RootLayoutError, { missingTags: rootLayoutMissingTagsError.missingTags })) : hasBuildError ? (_jsx(BuildError, { message: state.buildError, versionInfo: state.versionInfo })) : reactError ? (_jsx(Errors, { versionInfo: state.versionInfo, initialDisplayState: "fullscreen", errors: [reactError] })) : hasRuntimeErrors ? (_jsx(Errors, { initialDisplayState: "minimized", errors: state.errors, versionInfo: state.versionInfo })) : undefined] })) : undefined] }));
    }
}
export default ReactDevOverlay;
