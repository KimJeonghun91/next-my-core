import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { fillCacheWithDataProperty } from './fill-cache-with-data-property';
describe('fillCacheWithDataProperty', () => {
    it('should add data property', () => {
        const fetchServerResponseMock = jest.fn(() => Promise.resolve([
            /* TODO-APP: replace with actual FlightData */ '',
            undefined,
        ]));
        const pathname = '/dashboard/settings';
        const segments = pathname.split('/');
        const flightSegmentPath = segments
            .slice(1)
            .map((segment) => ['children', segment])
            .flat();
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
        fillCacheWithDataProperty(cache, existingCache, flightSegmentPath, () => fetchServerResponseMock());
        expect(cache).toMatchInlineSnapshot(`
      {
        "lazyData": null,
        "parallelRoutes": Map {
          "children" => Map {
            "linking" => {
              "lazyData": null,
              "parallelRoutes": Map {
                "children" => Map {
                  "" => {
                    "lazyData": null,
                    "parallelRoutes": Map {},
                    "prefetchRsc": null,
                    "rsc": <React.Fragment>
                      Page
                    </React.Fragment>,
                  },
                },
              },
              "prefetchRsc": null,
              "rsc": <React.Fragment>
                Linking
              </React.Fragment>,
            },
            "dashboard" => {
              "lazyData": Promise {},
              "parallelRoutes": Map {},
              "prefetchRsc": null,
              "rsc": null,
            },
          },
        },
        "prefetchRsc": null,
        "rsc": null,
      }
    `);
    });
});
