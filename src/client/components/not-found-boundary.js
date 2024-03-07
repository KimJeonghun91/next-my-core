'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useContext } from 'react';
import { usePathname } from './navigation';
import { isNotFoundError } from './not-found';
import { warnOnce } from '../../shared/lib/utils/warn-once';
import { MissingSlotContext } from '../../shared/lib/app-router-context.shared-runtime';
class NotFoundErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notFoundTriggered: !!props.asNotFound,
            previousPathname: props.pathname,
        };
    }
    componentDidCatch() {
        if (process.env.NODE_ENV === 'development' &&
            // A missing children slot is the typical not-found case, so no need to warn
            !this.props.missingSlots.has('children')) {
            let warningMessage = 'No default component was found for a parallel route rendered on this page. Falling back to nearest NotFound boundary.\n' +
                'Learn more: https://nextjs.org/docs/app/building-your-application/routing/parallel-routes#defaultjs\n\n';
            if (this.props.missingSlots.size > 0) {
                const formattedSlots = Array.from(this.props.missingSlots)
                    .sort((a, b) => a.localeCompare(b))
                    .map((slot) => `@${slot}`)
                    .join(', ');
                warningMessage += 'Missing slots: ' + formattedSlots;
            }
            warnOnce(warningMessage);
        }
    }
    static getDerivedStateFromError(error) {
        if (isNotFoundError(error)) {
            return {
                notFoundTriggered: true,
            };
        }
        // Re-throw if error is not for 404
        throw error;
    }
    static getDerivedStateFromProps(props, state) {
        /**
         * Handles reset of the error boundary when a navigation happens.
         * Ensures the error boundary does not stay enabled when navigating to a new page.
         * Approach of setState in render is safe as it checks the previous pathname and then overrides
         * it as outlined in https://react.dev/reference/react/useState#storing-information-from-previous-renders
         */
        if (props.pathname !== state.previousPathname && state.notFoundTriggered) {
            return {
                notFoundTriggered: false,
                previousPathname: props.pathname,
            };
        }
        return {
            notFoundTriggered: state.notFoundTriggered,
            previousPathname: props.pathname,
        };
    }
    render() {
        if (this.state.notFoundTriggered) {
            return (_jsxs(_Fragment, { children: [_jsx("meta", { name: "robots", content: "noindex" }), process.env.NODE_ENV === 'development' && (_jsx("meta", { name: "next-error", content: "not-found" })), this.props.notFoundStyles, this.props.notFound] }));
        }
        return this.props.children;
    }
}
export function NotFoundBoundary({ notFound, notFoundStyles, asNotFound, children, }) {
    const pathname = usePathname();
    const missingSlots = useContext(MissingSlotContext);
    return notFound ? (_jsx(NotFoundErrorBoundary, { pathname: pathname, notFound: notFound, notFoundStyles: notFoundStyles, asNotFound: asNotFound, missingSlots: missingSlots, children: children })) : (_jsx(_Fragment, { children: children }));
}
