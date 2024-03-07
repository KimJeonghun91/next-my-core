import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { fillLazyItemsTillLeafWithHead } from './fill-lazy-items-till-leaf-with-head';
const getFlightData = () => {
    return [
        [
            [
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
            ],
            ['', {}, _jsx("h1", { children: "About Page!" })],
            _jsx(_Fragment, { children: _jsx("title", { children: "About page!" }) }),
        ],
    ];
};
describe('fillLazyItemsTillLeafWithHead', () => {
    it('should fill lazy items till leaf with head', () => {
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
        const flightData = getFlightData();
        if (typeof flightData === 'string') {
            throw new Error('invalid flight data');
        }
        // Mirrors the way router-reducer values are passed in.
        const flightDataPath = flightData[0];
        const [treePatch, cacheNodeSeedData, head] = flightDataPath.slice(-3);
        fillLazyItemsTillLeafWithHead(cache, existingCache, treePatch, cacheNodeSeedData, head);
        const expectedCache = {
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
        expect(cache).toMatchObject(expectedCache);
    });
});
