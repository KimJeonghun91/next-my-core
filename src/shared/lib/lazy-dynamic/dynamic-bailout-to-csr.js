'use client';
import { BailoutToCSRError } from './bailout-to-csr';
/**
 * If rendered on the server, this component throws an error
 * to signal Next.js that it should bail out to client-side rendering instead.
 */
export function BailoutToCSR({ reason, children }) {
    if (typeof window === 'undefined') {
        throw new BailoutToCSRError(reason);
    }
    return children;
}
