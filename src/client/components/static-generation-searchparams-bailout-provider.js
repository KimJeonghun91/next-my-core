'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { createSearchParamsBailoutProxy } from './searchparams-bailout-proxy';
export default function StaticGenerationSearchParamsBailoutProvider({ Component, propsForComponent, isStaticGeneration, }) {
    if (isStaticGeneration) {
        const searchParams = createSearchParamsBailoutProxy();
        return _jsx(Component, Object.assign({ searchParams: searchParams }, propsForComponent));
    }
    return _jsx(Component, Object.assign({}, propsForComponent));
}
