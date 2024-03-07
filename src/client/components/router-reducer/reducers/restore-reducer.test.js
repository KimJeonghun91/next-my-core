import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { createInitialRouterState } from '../create-initial-router-state';
import { ACTION_RESTORE } from '../router-reducer-types';
import { restoreReducer } from './restore-reducer';
const buildId = 'development';
const getInitialRouterStateTree = () => [
    '',
    {
        children: [
            'linking',
            {
                children: ['about', { children: ['', {}] }],
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
describe('serverPatchReducer', () => {
    it('should apply server patch', async () => {
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
            type: ACTION_RESTORE,
            url: new URL('/linking/about', 'https://localhost'),
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
                null,
                null,
                true,
            ],
        };
        const newState = await runPromiseThrowChain(() => restoreReducer(state, action));
        const expectedState = {
            buildId,
            prefetchCache: new Map(),
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
            canonicalUrl: '/linking/about',
            nextUrl: '/linking/about',
            cache: {
                lazyData: null,
                rsc: (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: "Root layout" })] })),
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
                ]),
            },
            tree: [
                '',
                {
                    children: [
                        'linking',
                        {
                            children: ['about', { children: ['', {}] }],
                        },
                    ],
                },
                null,
                null,
                true,
            ],
        };
        expect(newState).toMatchObject(expectedState);
    });
    it('should apply server patch (concurrent)', async () => {
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
            type: ACTION_RESTORE,
            url: new URL('/linking/about', 'https://localhost'),
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
                null,
                null,
                true,
            ],
        };
        await runPromiseThrowChain(() => restoreReducer(state, action));
        const newState = await runPromiseThrowChain(() => restoreReducer(state2, action));
        const expectedState = {
            buildId,
            prefetchCache: new Map(),
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
            canonicalUrl: '/linking/about',
            nextUrl: '/linking/about',
            cache: {
                lazyData: null,
                rsc: (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: "Root layout" })] })),
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
                ]),
            },
            tree: [
                '',
                {
                    children: [
                        'linking',
                        {
                            children: ['about', { children: ['', {}] }],
                        },
                    ],
                },
                null,
                null,
                true,
            ],
        };
        expect(newState).toMatchObject(expectedState);
    });
});
