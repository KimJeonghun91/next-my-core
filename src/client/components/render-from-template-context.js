'use client';
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useContext } from 'react';
import { TemplateContext } from '../../shared/lib/app-router-context.shared-runtime';
export default function RenderFromTemplateContext() {
    const children = useContext(TemplateContext);
    return _jsx(_Fragment, { children: children });
}
