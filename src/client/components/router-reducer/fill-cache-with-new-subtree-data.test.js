import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { fillCacheWithNewSubTreeData } from './fill-cache-with-new-subtree-data';
const getFlightData = () => {
    return [
        [
            'children',
            'linking',
            'children',
            'about',
            [
                'about',
                {
                    children: ['', {}],
                },
            ],
            ['about', {}, _jsx("h1", { children: "SubTreeData Injected!" })],
            _jsx(_Fragment, { children: _jsx("title", { children: "Head Injected!" }) }),
        ],
    ];
};
describe('fillCacheWithNewSubtreeData', () => {
    it('should apply rsc and head property', () => {
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
        fillCacheWithNewSubTreeData(cache, existingCache, flightDataPath, false);
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
                                rsc: _jsx(_Fragment, { children: "Linking" }),
                                prefetchRsc: null,
                                parallelRoutes: new Map([
                                    [
                                        'children',
                                        new Map([
                                            // TODO-APP: this segment should be preserved when creating the new cache
                                            [
                                                '',
                                                {
                                                    lazyData: null,
                                                    rsc: _jsx(_Fragment, { children: "Page" }),
                                                    prefetchRsc: null,
                                                    parallelRoutes: new Map(),
                                                },
                                            ],
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
                                                                        head: (_jsx(_Fragment, { children: _jsx("title", { children: "Head Injected!" }) })),
                                                                    },
                                                                ],
                                                            ]),
                                                        ],
                                                    ]),
                                                    rsc: _jsx("h1", { children: "SubTreeData Injected!" }),
                                                    prefetchRsc: null,
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
