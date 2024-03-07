import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { createInitialRouterState } from './create-initial-router-state';
const buildId = 'development';
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
describe('createInitialRouterState', () => {
    it('should return the correct initial router state', () => {
        const initialTree = getInitialRouterStateTree();
        const initialCanonicalUrl = '/linking';
        const children = (_jsxs("html", { children: [_jsx("head", {}), _jsx("body", { children: "Root layout" })] }));
        const initialParallelRoutes = new Map();
        const state = createInitialRouterState({
            buildId,
            initialTree,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
            initialHead: _jsx("title", { children: "Test" }),
        });
        const state2 = createInitialRouterState({
            buildId,
            initialTree,
            initialCanonicalUrl,
            initialSeedData: ['', {}, children],
            initialParallelRoutes,
            isServer: false,
            location: new URL('/linking', 'https://localhost'),
            initialHead: _jsx("title", { children: "Test" }),
        });
        const expectedCache = {
            lazyData: null,
            rsc: children,
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
                                                    head: _jsx("title", { children: "Test" }),
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
        };
        const expected = {
            buildId,
            tree: initialTree,
            canonicalUrl: initialCanonicalUrl,
            prefetchCache: new Map(),
            pushRef: {
                pendingPush: false,
                mpaNavigation: false,
                preserveCustomHistoryState: true,
            },
            focusAndScrollRef: {
                apply: false,
                onlyHashChange: false,
                hashFragment: null,
                segmentPaths: [],
            },
            cache: expectedCache,
            nextUrl: '/linking',
        };
        expect(state).toMatchObject(expected);
        expect(state2).toMatchObject(expected);
    });
});
