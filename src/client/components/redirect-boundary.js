'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect } from 'react';
import { useRouter } from './navigation';
import { RedirectType, getRedirectTypeFromError, getURLFromRedirectError, isRedirectError, } from './redirect';
function HandleRedirect({ redirect, reset, redirectType, }) {
    const router = useRouter();
    useEffect(() => {
        React.startTransition(() => {
            if (redirectType === RedirectType.push) {
                router.push(redirect, {});
            }
            else {
                router.replace(redirect, {});
            }
            reset();
        });
    }, [redirect, redirectType, reset, router]);
    return null;
}
export class RedirectErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { redirect: null, redirectType: null };
    }
    static getDerivedStateFromError(error) {
        if (isRedirectError(error)) {
            const url = getURLFromRedirectError(error);
            const redirectType = getRedirectTypeFromError(error);
            return { redirect: url, redirectType };
        }
        // Re-throw if error is not for redirect
        throw error;
    }
    render() {
        const { redirect, redirectType } = this.state;
        if (redirect !== null && redirectType !== null) {
            return (_jsx(HandleRedirect, { redirect: redirect, redirectType: redirectType, reset: () => this.setState({ redirect: null }) }));
        }
        return this.props.children;
    }
}
export function RedirectBoundary({ children }) {
    const router = useRouter();
    return (_jsx(RedirectErrorBoundary, { router: router, children: children }));
}
