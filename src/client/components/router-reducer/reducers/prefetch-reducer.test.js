import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { createInitialRouterState } from '../create-initial-router-state';
import { ACTION_PREFETCH, PrefetchKind } from '../router-reducer-types';
import { prefetchReducer } from './prefetch-reducer';
import { fetchServerResponse } from '../fetch-server-response';
jest.mock('../fetch-server-response', () => {
    const flightData = [
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
    return {
        fetchServerResponse: (url) => {
            if (url.pathname === '/linking/about') {
                return Promise.resolve([flightData, undefined]);
            }
            throw new Error('unknown url in mock');
        },
    };
});
const getInitialRouterStateTree = () => [
    '',
    {
        children: [
            'linking',
            {
                children: ['', {}],
            },
        ],
    },
    undefined,
    undefined,
    true,
];
async function runPromiseThrowChain(fn) {
    try {
        return await fn();
    }
    catch (err) {
        if (err instanceof Promise) {
            await err;
            return await runPromiseThrowChain(fn);
        }
        throw err;
    }
}
describe('prefetchReducer', () => {
    it('should apply navigation', async () => {
        const initialTree = getInitialRouterStateTree();
        const initialCanonicalUrl = '/linking';
        const children = (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: "Root layout" })] }));
        const initialParallelRoutes = new Map([
            [
                'children',
                new Map([
                    [
                        'linking',
                        {
                            parallelRoutes: new Map([
                                [
                                    'children',
                                    new Map([
                                        [
                                            '',
                                            {
                                                lazyData: null,
                                                rsc: _jsx(_Fragment, { children: "Linking page" }),
                                                prefetchRsc: null,
                                                parallelRoutes: new Map(),
                                            },
                                        ],
                                    ]),
                                ],
                            ]),
                            lazyData: null,
                            rsc: _jsx(_Fragment, { children: "Linking layout level" }),
                            prefetchRsc: null,
                        },
                    ],
                ]),
            ],
        ]);
        const state = createInitialRouterState({
            buildId: 'development',
            initialTree,
            initialHead: null,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
        });
        const url = new URL('/linking/about', 'https://localhost');
        const serverResponse = await fetchServerResponse(url, initialTree, null, PrefetchKind.AUTO);
        const action = {
            type: ACTION_PREFETCH,
            url,
            kind: PrefetchKind.AUTO,
        };
        const newState = await runPromiseThrowChain(() => prefetchReducer(state, action));
        const prom = Promise.resolve(serverResponse);
        await prom;
        const expectedState = {
            buildId: 'development',
            prefetchCache: new Map([
                [
                    '/linking/about',
                    {
                        data: prom,
                        kind: PrefetchKind.AUTO,
                        lastUsedTime: null,
                        prefetchTime: expect.any(Number),
                        treeAtTimeOfPrefetch: [
                            '',
                            {
                                children: [
                                    'linking',
                                    {
                                        children: ['', {}],
                                    },
                                ],
                            },
                            undefined,
                            undefined,
                            true,
                        ],
                    },
                ],
            ]),
            pushRef: {
                mpaNavigation: false,
                pendingPush: false,
                preserveCustomHistoryState: true,
            },
            focusAndScrollRef: {
                apply: false,
                onlyHashChange: false,
                hashFragment: null,
                segmentPaths: [],
            },
            canonicalUrl: '/linking',
            cache: {
                lazyData: null,
                rsc: (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: "Root layout" })] })),
                prefetchRsc: null,
                parallelRoutes: initialParallelRoutes,
            },
            tree: [
                '',
                {
                    children: [
                        'linking',
                        {
                            children: ['', {}],
                        },
                    ],
                },
                undefined,
                undefined,
                true,
            ],
            nextUrl: '/linking',
        };
        expect(newState).toMatchObject(expectedState);
    });
    it('should apply navigation (concurrent)', async () => {
        const initialTree = getInitialRouterStateTree();
        const initialCanonicalUrl = '/linking';
        const children = (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: "Root layout" })] }));
        const initialParallelRoutes = new Map([
            [
                'children',
                new Map([
                    [
                        'linking',
                        {
                            parallelRoutes: new Map([
                                [
                                    'children',
                                    new Map([
                                        [
                                            '',
                                            {
                                                lazyData: null,
                                                rsc: _jsx(_Fragment, { children: "Linking page" }),
                                                prefetchRsc: null,
                                                parallelRoutes: new Map(),
                                            },
                                        ],
                                    ]),
                                ],
                            ]),
                            lazyData: null,
                            rsc: _jsx(_Fragment, { children: "Linking layout level" }),
                            prefetchRsc: null,
                        },
                    ],
                ]),
            ],
        ]);
        const state = createInitialRouterState({
            buildId: 'development',
            initialTree,
            initialHead: null,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
        });
        const state2 = createInitialRouterState({
            buildId: 'development',
            initialTree,
            initialHead: null,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
        });
        const url = new URL('/linking/about', 'https://localhost');
        const serverResponse = await fetchServerResponse(url, initialTree, null, state.buildId, PrefetchKind.AUTO);
        const action = {
            type: ACTION_PREFETCH,
            url,
            kind: PrefetchKind.AUTO,
        };
        await runPromiseThrowChain(() => prefetchReducer(state, action));
        const newState = await runPromiseThrowChain(() => prefetchReducer(state2, action));
        const prom = Promise.resolve(serverResponse);
        await prom;
        const expectedState = {
            buildId: 'development',
            prefetchCache: new Map([
                [
                    '/linking/about',
                    {
                        data: prom,
                        prefetchTime: expect.any(Number),
                        kind: PrefetchKind.AUTO,
                        lastUsedTime: null,
                        treeAtTimeOfPrefetch: [
                            '',
                            {
                                children: [
                                    'linking',
                                    {
                                        children: ['', {}],
                                    },
                                ],
                            },
                            undefined,
                            undefined,
                            true,
                        ],
                    },
                ],
            ]),
            pushRef: {
                mpaNavigation: false,
                pendingPush: false,
                preserveCustomHistoryState: true,
            },
            focusAndScrollRef: {
                apply: false,
                onlyHashChange: false,
                hashFragment: null,
                segmentPaths: [],
            },
            canonicalUrl: '/linking',
            cache: {
                lazyData: null,
                rsc: (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: "Root layout" })] })),
                prefetchRsc: null,
                parallelRoutes: initialParallelRoutes,
            },
            tree: [
                '',
                {
                    children: [
                        'linking',
                        {
                            children: ['', {}],
                        },
                    ],
                },
                undefined,
                undefined,
                true,
            ],
            nextUrl: '/linking',
        };
        expect(newState).toMatchObject(expectedState);
    });
});
