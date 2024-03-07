import { test as base, defineConfig } from './index';
import { MockedRequest, handleRequest,
// eslint-disable-next-line import/no-extraneous-dependencies
 } from 'msw';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Emitter } from 'strict-event-emitter';
// eslint-disable-next-line import/no-extraneous-dependencies
export * from 'msw';
// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@playwright/test';
export { defineConfig };
export const test = base.extend({
    mswHandlers: [[], { option: true }],
    msw: [
        async ({ next, mswHandlers }, use) => {
            const handlers = [...mswHandlers];
            const emitter = new Emitter();
            next.onFetch(async (request) => {
                const { body, method, headers, credentials, cache, redirect, integrity, keepalive, mode, destination, referrer, referrerPolicy, } = request;
                const mockedRequest = new MockedRequest(new URL(request.url), {
                    body: body ? await request.arrayBuffer() : undefined,
                    method,
                    headers: Object.fromEntries(headers),
                    credentials,
                    cache,
                    redirect,
                    integrity,
                    keepalive,
                    mode,
                    destination,
                    referrer,
                    referrerPolicy,
                });
                let isUnhandled = false;
                let isPassthrough = false;
                let mockedResponse;
                await handleRequest(mockedRequest, handlers.slice(0), {
                    onUnhandledRequest: () => {
                        isUnhandled = true;
                    },
                }, emitter, {
                    onPassthroughResponse: () => {
                        isPassthrough = true;
                    },
                    onMockedResponse: (r) => {
                        mockedResponse = r;
                    },
                });
                if (isUnhandled) {
                    return undefined;
                }
                if (isPassthrough) {
                    return 'continue';
                }
                if (mockedResponse) {
                    const { status, headers: responseHeaders, body: responseBody, delay, } = mockedResponse;
                    if (delay) {
                        await new Promise((resolve) => setTimeout(resolve, delay));
                    }
                    return new Response(responseBody, {
                        status,
                        headers: new Headers(responseHeaders),
                    });
                }
                return 'abort';
            });
            await use({
                use: (...newHandlers) => {
                    handlers.unshift(...newHandlers);
                },
            });
            handlers.length = 0;
        },
        { auto: true },
    ],
});
export default test;
