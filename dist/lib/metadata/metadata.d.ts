import type { GetDynamicParamFromSegment } from '../../server/app-render/app-render';
import type { LoaderTree } from '../../server/lib/app-dir-module';
import React from 'react';
export declare function createMetadataComponents({ tree, pathname, searchParams, trailingSlash, getDynamicParamFromSegment, appUsingSizeAdjustment, errorType, }: {
    tree: LoaderTree;
    pathname: string;
    searchParams: {
        [key: string]: any;
    };
    trailingSlash: boolean;
    getDynamicParamFromSegment: GetDynamicParamFromSegment;
    appUsingSizeAdjustment: boolean;
    errorType?: 'not-found' | 'redirect';
}): [React.ComponentType, React.ComponentType];
