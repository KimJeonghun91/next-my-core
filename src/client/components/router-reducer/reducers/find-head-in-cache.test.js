import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { findHeadInCache } from './find-head-in-cache';
describe('findHeadInCache', () => {
    it('should find the head', () => {
        const routerTree = [
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
            undefined,
            undefined,
            true,
        ];
        const cache = {
            lazyData: null,
            rsc: null,
            prefetchRsc: null,
            parallelRoutes: new Map([
                [
                    'children',
                    new Map([
                        [
                            'linking',
                            {
                                lazyData: null,
                                rsc: null,
                                prefetchRsc: null,
                                parallelRoutes: new Map([
                                    [
                                        'children',
                                        new Map([
                                            [
                                                'about',
                                                {
                                                    lazyData: null,
                                                    parallelRoutes: new Map([
                                                        [
                                                            'children',
                                                            new Map([
                                                                [
                                                                    '',
                                                                    {
                                                                        lazyData: null,
                                                                        rsc: null,
                                                                        prefetchRsc: null,
                                                                        parallelRoutes: new Map(),
                                                                        head: (_jsx(_Fragment, { children: _jsx("title", { children: "About page!" }) })),
                                                                    },
                                                                ],
                                                            ]),
                                                        ],
                                                    ]),
                                                    rsc: null,
                                                    prefetchRsc: null,
                                                },
                                            ],
                                            // TODO-APP: this segment should be preserved when creating the new cache
                                            // [
                                            //   '',
                                            //   {
                                            //     lazyData: null,
                                            //     rsc: <>Page</>,
                                            //     prefetchRsc: null,
                                            //     parallelRoutes: new Map(),
                                            //   },
                                            // ],
                                        ]),
                                    ],
                                ]),
                            },
                        ],
                    ]),
                ],
            ]),
        };
        const result = findHeadInCache(cache, routerTree[1]);
        expect(result).not.toBeNull();
        const [cacheNode, key] = result;
        expect(cacheNode.head).toMatchObject(_jsx(_Fragment, { children: _jsx("title", { children: "About page!" }) }));
        expect(key).toBe('/linking/about/');
    });
});
