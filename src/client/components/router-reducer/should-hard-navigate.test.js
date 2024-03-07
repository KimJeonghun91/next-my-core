import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { shouldHardNavigate } from './should-hard-navigate';
describe('shouldHardNavigate', () => {
    it('should return false if the segments match', () => {
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
        const initialRouterStateTree = getInitialRouterStateTree();
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
        const flightData = getFlightData();
        if (typeof flightData === 'string') {
            throw new Error('invalid flight data');
        }
        // Mirrors the way router-reducer values are passed in.
        const flightDataPath = flightData[0];
        const flightSegmentPath = flightDataPath.slice(0, -3);
        const result = shouldHardNavigate(['', ...flightSegmentPath], initialRouterStateTree);
        expect(result).toBe(false);
    });
    it('should return false if segments are dynamic and match', () => {
        const getInitialRouterStateTree = () => [
            '',
            {
                children: [
                    'link-hard-push',
                    {
                        children: [
                            ['id', '123', 'd'],
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
        const initialRouterStateTree = getInitialRouterStateTree();
        const getFlightData = () => {
            return [
                [
                    'children',
                    'link-hard-push',
                    'children',
                    ['id', '123', 'd'],
                    [
                        ['id', '123', 'd'],
                        {
                            children: ['', {}],
                        },
                    ],
                    [['id', '123', 'd'], {}, null],
                    null,
                ],
            ];
        };
        const flightData = getFlightData();
        if (typeof flightData === 'string') {
            throw new Error('invalid flight data');
        }
        // Mirrors the way router-reducer values are passed in.
        const flightDataPath = flightData[0];
        const flightSegmentPath = flightDataPath.slice(0, -3);
        const result = shouldHardNavigate(['', ...flightSegmentPath], initialRouterStateTree);
        expect(result).toBe(false);
    });
    it('should return true if segments are dynamic and mismatch', () => {
        const getInitialRouterStateTree = () => [
            '',
            {
                children: [
                    'link-hard-push',
                    {
                        children: [
                            ['id', '456', 'd'],
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
        const initialRouterStateTree = getInitialRouterStateTree();
        const getFlightData = () => {
            return [
                [
                    'children',
                    'link-hard-push',
                    'children',
                    ['id', '123', 'd'],
                    [
                        ['id', '123', 'd'],
                        {
                            children: ['', {}],
                        },
                    ],
                    [['id', '123', 'd'], {}, null],
                    null,
                ],
            ];
        };
        const flightData = getFlightData();
        if (typeof flightData === 'string') {
            throw new Error('invalid flight data');
        }
        // Mirrors the way router-reducer values are passed in.
        const flightDataPath = flightData[0];
        const flightSegmentPath = flightDataPath.slice(0, -3);
        const result = shouldHardNavigate(['', ...flightSegmentPath], initialRouterStateTree);
        expect(result).toBe(true);
    });
});
