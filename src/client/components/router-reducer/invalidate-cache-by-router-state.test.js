import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { invalidateCacheByRouterState } from './invalidate-cache-by-router-state';
describe('invalidateCacheByRouterState', () => {
    it('should invalidate the cache by router state', () => {
        const cache = {
            lazyData: null,
            rsc: null,
            prefetchRsc: null,
            parallelRoutes: new Map(),
        };
        const existingCache = {
            lazyData: null,
            rsc: _jsx(_Fragment, { children: "Root layout" }),
            prefetchRsc: null,
            parallelRoutes: new Map([
                [
                    'children',
                    new Map([
                        [
                            'linking',
                            {
                                lazyData: null,
                                rsc: _jsx(_Fragment, { children: "Linking" }),
                                prefetchRsc: null,
                                parallelRoutes: new Map([
                                    [
                                        'children',
                                        new Map([
                                            [
                                                '',
                                                {
                                                    lazyData: null,
                                                    rsc: _jsx(_Fragment, { children: "Page" }),
                                                    prefetchRsc: null,
                                                    parallelRoutes: new Map(),
                                                },
                                            ],
                                        ]),
                                    ],
                                ]),
                            },
                        ],
                    ]),
                ],
            ]),
        };
        const routerState = [
            '',
            {
                children: [
                    'linking',
                    {
                        children: [
                            'about',
                            {
                                children: ['', {}],
                            },
                        ],
                    },
                ],
            },
            null,
            null,
            true,
        ];
        invalidateCacheByRouterState(cache, existingCache, routerState);
        const expectedCache = {
            lazyData: null,
            rsc: null,
            prefetchRsc: null,
            parallelRoutes: new Map([['children', new Map()]]),
        };
        expect(cache).toMatchObject(expectedCache);
    });
});
