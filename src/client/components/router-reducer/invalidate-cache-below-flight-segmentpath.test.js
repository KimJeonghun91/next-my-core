import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { invalidateCacheBelowFlightSegmentPath } from './invalidate-cache-below-flight-segmentpath';
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
            ['about', {}, _jsx("h1", { children: "About Page!" })],
            _jsx(_Fragment, { children: _jsx("title", { children: "About page!" }) }),
        ],
    ];
};
describe('invalidateCacheBelowFlightSegmentPath', () => {
    it('should invalidate cache below flight segment path', () => {
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
        const flightSegmentPath = flightDataPath.slice(0, -3);
        // Copy rsc for the root node of the cache.
        cache.rsc = existingCache.rsc;
        cache.prefetchRsc = existingCache.prefetchRsc;
        // Create a copy of the existing cache with the rsc applied.
        fillCacheWithNewSubTreeData(cache, existingCache, flightDataPath, false);
        // Invalidate the cache below the flight segment path. This should remove the 'about' node.
        invalidateCacheBelowFlightSegmentPath(cache, existingCache, flightSegmentPath);
        const expectedCache = {
            lazyData: null,
            parallelRoutes: new Map([
                [
                    'children',
                    new Map([
                        [
                            'linking',
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
                                                    parallelRoutes: new Map(),
                                                    rsc: _jsx(React.Fragment, { children: "Page" }),
                                                    prefetchRsc: null,
                                                },
                                            ],
                                        ]),
                                    ],
                                ]),
                                rsc: _jsx(React.Fragment, { children: "Linking" }),
                                prefetchRsc: null,
                            },
                        ],
                    ]),
                ],
            ]),
            rsc: _jsx(_Fragment, { children: "Root layout" }),
            prefetchRsc: null,
        };
        expect(cache).toMatchObject(expectedCache);
    });
});
