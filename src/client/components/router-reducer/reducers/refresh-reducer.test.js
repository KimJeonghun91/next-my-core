import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { createInitialRouterState } from '../create-initial-router-state';
import { ACTION_REFRESH } from '../router-reducer-types';
import { refreshReducer } from './refresh-reducer';
const buildId = 'development';
jest.mock('../fetch-server-response', () => {
    const flightData = [
        [
            [
                '',
                {
                    children: [
                        'linking',
                        {
                            children: ['', {}],
                        },
                    ],
                },
                null,
                null,
                true,
            ],
            [
                '',
                {},
                _jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: _jsx("h1", { children: "Linking Page!" }) })] }),
            ],
            _jsx(_Fragment, { children: _jsx("title", { children: "Linking page!" }) }),
        ],
    ];
    return {
        fetchServerResponse: (url) => {
            if (url.pathname === '/linking') {
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
describe('refreshReducer', () => {
    it('should apply refresh', async () => {
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
            buildId,
            initialTree,
            initialHead: null,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
        });
        const action = {
            type: ACTION_REFRESH,
            origin: new URL('/linking', 'https://localhost').origin,
        };
        const newState = await runPromiseThrowChain(() => refreshReducer(state, action));
        const expectedState = {
            buildId,
            prefetchCache: new Map(),
            pushRef: {
                mpaNavigation: false,
                pendingPush: false,
                preserveCustomHistoryState: false,
            },
            focusAndScrollRef: {
                apply: false,
                onlyHashChange: false,
                hashFragment: null,
                segmentPaths: [],
            },
            canonicalUrl: '/linking',
            nextUrl: '/linking',
            cache: {
                lazyData: null,
                rsc: (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: _jsx("h1", { children: "Linking Page!" }) })] })),
                prefetchRsc: null,
                parallelRoutes: new Map([
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
                                                        rsc: null,
                                                        prefetchRsc: null,
                                                        parallelRoutes: new Map(),
                                                        head: (_jsx(_Fragment, { children: _jsx("title", { children: "Linking page!" }) })),
                                                    },
                                                ],
                                            ]),
                                        ],
                                    ]),
                                    lazyData: null,
                                    rsc: null,
                                    prefetchRsc: null,
                                },
                            ],
                        ]),
                    ],
                ]),
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
        };
        expect(newState).toMatchObject(expectedState);
    });
    it('should apply refresh (concurrent)', async () => {
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
            buildId,
            initialTree,
            initialHead: null,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
        });
        const state2 = createInitialRouterState({
            buildId,
            initialTree,
            initialHead: null,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
        });
        const action = {
            type: ACTION_REFRESH,
            origin: new URL('/linking', 'https://localhost').origin,
        };
        await runPromiseThrowChain(() => refreshReducer(state, action));
        const newState = await runPromiseThrowChain(() => refreshReducer(state2, action));
        const expectedState = {
            buildId,
            prefetchCache: new Map(),
            pushRef: {
                mpaNavigation: false,
                pendingPush: false,
                preserveCustomHistoryState: false,
            },
            focusAndScrollRef: {
                apply: false,
                onlyHashChange: false,
                hashFragment: null,
                segmentPaths: [],
            },
            canonicalUrl: '/linking',
            nextUrl: '/linking',
            cache: {
                lazyData: null,
                rsc: (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: _jsx("h1", { children: "Linking Page!" }) })] })),
                prefetchRsc: null,
                parallelRoutes: new Map([
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
                                                        rsc: null,
                                                        prefetchRsc: null,
                                                        parallelRoutes: new Map(),
                                                        head: (_jsx(_Fragment, { children: _jsx("title", { children: "Linking page!" }) })),
                                                    },
                                                ],
                                            ]),
                                        ],
                                    ]),
                                    lazyData: null,
                                    rsc: null,
                                    prefetchRsc: null,
                                },
                            ],
                        ]),
                    ],
                ]),
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
        };
        expect(newState).toMatchObject(expectedState);
    });
    it('should invalidate all segments (concurrent)', async () => {
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
                    [
                        'about',
                        {
                            parallelRoutes: new Map([
                                [
                                    'children',
                                    new Map([
                                        [
                                            '',
                                            {
                                                lazyData: null,
                                                rsc: _jsx(_Fragment, { children: "About page" }),
                                                prefetchRsc: null,
                                                parallelRoutes: new Map(),
                                            },
                                        ],
                                    ]),
                                ],
                            ]),
                            lazyData: null,
                            rsc: _jsx(_Fragment, { children: "About layout level" }),
                            prefetchRsc: null,
                        },
                    ],
                ]),
            ],
        ]);
        const state = createInitialRouterState({
            buildId,
            initialTree,
            initialHead: null,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
        });
        const state2 = createInitialRouterState({
            buildId,
            initialTree,
            initialHead: null,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
        });
        const action = {
            type: ACTION_REFRESH,
            origin: new URL('/linking', 'https://localhost').origin,
        };
        await runPromiseThrowChain(() => refreshReducer(state, action));
        const newState = await runPromiseThrowChain(() => refreshReducer(state2, action));
        const expectedState = {
            buildId,
            prefetchCache: new Map(),
            pushRef: {
                mpaNavigation: false,
                pendingPush: false,
                preserveCustomHistoryState: false,
            },
            focusAndScrollRef: {
                apply: false,
                onlyHashChange: false,
                hashFragment: null,
                segmentPaths: [],
            },
            canonicalUrl: '/linking',
            nextUrl: '/linking',
            cache: {
                lazyData: null,
                rsc: (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: _jsx("h1", { children: "Linking Page!" }) })] })),
                prefetchRsc: null,
                parallelRoutes: new Map([
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
                                                        rsc: null,
                                                        prefetchRsc: null,
                                                        parallelRoutes: new Map(),
                                                        head: (_jsx(_Fragment, { children: _jsx("title", { children: "Linking page!" }) })),
                                                    },
                                                ],
                                            ]),
                                        ],
                                    ]),
                                    lazyData: null,
                                    rsc: null,
                                    prefetchRsc: null,
                                },
                            ],
                        ]),
                    ],
                ]),
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
        };
        expect(newState).toMatchObject(expectedState);
    });
    it('should invalidate prefetchCache (concurrent)', async () => {
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
                    [
                        'about',
                        {
                            parallelRoutes: new Map([
                                [
                                    'children',
                                    new Map([
                                        [
                                            '',
                                            {
                                                lazyData: null,
                                                rsc: _jsx(_Fragment, { children: "About page" }),
                                                prefetchRsc: null,
                                                parallelRoutes: new Map(),
                                            },
                                        ],
                                    ]),
                                ],
                            ]),
                            lazyData: null,
                            rsc: _jsx(_Fragment, { children: "About layout level" }),
                            prefetchRsc: null,
                        },
                    ],
                ]),
            ],
        ]);
        const prefetchItem = {
            canonicalUrlOverride: undefined,
            flightData: [
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
                    undefined,
                    undefined,
                    true,
                ],
                _jsx(_Fragment, { children: "About" }),
                _jsx(_Fragment, { children: "Head" }),
            ],
            tree: [
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
            ],
        };
        const state = createInitialRouterState({
            buildId,
            initialTree,
            initialHead: null,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
        });
        state.prefetchCache.set('/linking/about', prefetchItem);
        const state2 = createInitialRouterState({
            buildId,
            initialTree,
            initialHead: null,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
        });
        state2.prefetchCache.set('/linking/about', prefetchItem);
        const action = {
            type: ACTION_REFRESH,
            origin: new URL('/linking', 'https://localhost').origin,
        };
        await runPromiseThrowChain(() => refreshReducer(state, action));
        const newState = await runPromiseThrowChain(() => refreshReducer(state2, action));
        const expectedState = {
            buildId,
            prefetchCache: new Map(),
            pushRef: {
                mpaNavigation: false,
                pendingPush: false,
                preserveCustomHistoryState: false,
            },
            focusAndScrollRef: {
                apply: false,
                onlyHashChange: false,
                hashFragment: null,
                segmentPaths: [],
            },
            canonicalUrl: '/linking',
            nextUrl: '/linking',
            cache: {
                lazyData: null,
                rsc: (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: _jsx("h1", { children: "Linking Page!" }) })] })),
                prefetchRsc: null,
                parallelRoutes: new Map([
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
                                                        rsc: null,
                                                        prefetchRsc: null,
                                                        parallelRoutes: new Map(),
                                                        head: (_jsx(_Fragment, { children: _jsx("title", { children: "Linking page!" }) })),
                                                    },
                                                ],
                                            ]),
                                        ],
                                    ]),
                                    lazyData: null,
                                    rsc: null,
                                    prefetchRsc: null,
                                },
                            ],
                        ]),
                    ],
                ]),
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
        };
        expect(newState).toMatchObject(expectedState);
    });
});
