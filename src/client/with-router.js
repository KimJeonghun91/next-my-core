import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { useRouter } from './router';
export default function withRouter(ComposedComponent) {
    function WithRouterWrapper(props) {
        return _jsx(ComposedComponent, Object.assign({ router: useRouter() }, props));
    }
    WithRouterWrapper.getInitialProps = ComposedComponent.getInitialProps;
    WithRouterWrapper.origGetInitialProps = ComposedComponent.origGetInitialProps;
    if (process.env.NODE_ENV !== 'production') {
        const name = ComposedComponent.displayName || ComposedComponent.name || 'Unknown';
        WithRouterWrapper.displayName = `withRouter(${name})`;
    }
    return WithRouterWrapper;
}
