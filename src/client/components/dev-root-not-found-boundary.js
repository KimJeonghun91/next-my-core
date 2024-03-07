'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { NotFoundBoundary } from './not-found-boundary';
export function bailOnNotFound() {
    throw new Error('notFound() is not allowed to use in root layout');
}
function NotAllowedRootNotFoundError() {
    bailOnNotFound();
    return null;
}
export function DevRootNotFoundBoundary({ children, }) {
    return (_jsx(NotFoundBoundary, { notFound: _jsx(NotAllowedRootNotFoundError, {}), children: children }));
}
